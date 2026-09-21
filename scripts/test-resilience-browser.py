#!/usr/bin/env python3
import argparse
import json
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def wait_app(page, game_id=None):
    if game_id:
        page.wait_for_function(
            "(id) => window.__PA_RESILIENCE__?.version === 18 && "
            "document.querySelector('.game-page')?.dataset.playGame === id",
            arg=game_id,
            timeout=30000,
        )
    else:
        page.wait_for_function(
            "() => window.__PA_RESILIENCE__?.version === 18 && document.querySelector('#main')",
            timeout=30000,
        )

def open_game(page, base_url, seed):
    page.goto(
        f"{base_url.rstrip('/')}/#/game/sudoku?seed={seed}&difficulty=Easy",
        wait_until="domcontentloaded",
        timeout=30000,
    )
    wait_app(page, "sudoku")

def exercise_two_tabs(context, base_url, seed, expect_transport=None):
    errors=[]
    pages=[]
    for _ in range(2):
        page=context.new_page()
        pages.append(page)
        page.on("pageerror", lambda exc, errors=errors: errors.append(str(exc)))
        open_game(page, base_url, seed)

    first,second=pages
    # Opening the second tab can legitimately create a newer repaired save. Reconcile
    # both live pages before the first deliberate write so stale-write rejection is
    # tested as a guard, not mistaken for a synchronization failure.
    first.evaluate("async () => { await window.__PA_RESILIENCE__.resync(); await window.__PA_RESILIENCE__.waitForSync(); }")
    second.evaluate("async () => { await window.__PA_RESILIENCE__.resync(); await window.__PA_RESILIENCE__.waitForSync(); }")
    before1=first.evaluate("() => window.__PA_RESILIENCE__.summary()")
    before2=second.evaluate("() => window.__PA_RESILIENCE__.summary()")
    if before1["tabId"] == before2["tabId"]:
        raise AssertionError("two tabs unexpectedly share a tab identity")
    if expect_transport:
        if before1["transport"] != expect_transport or before2["transport"] != expect_transport:
            raise AssertionError(
                f"expected transport {expect_transport}, got "
                f"{before1['transport']} / {before2['transport']}"
            )

    # Two writes queued from the same live object must both commit. This is the
    # regression for the Phase 18 lock-wait revision race that could otherwise
    # discard a later completion/autosave as if it came from a stale tab.
    queued=first.evaluate(
        "async () => await Promise.all(["
        "window.__PA_RESILIENCE__.probeCurrent(),"
        "window.__PA_RESILIENCE__.probeCurrent()])"
    )
    if not all(x.get("pass") for x in queued):
        raise AssertionError(f"queued same-tab saves diverged: {queued}")
    queued_expected=max(x["expected"] for x in queued)
    second.wait_for_function(
        "(expected) => window.__PA_RESILIENCE__?.summary()?.current?.hintsUsed >= expected",
        arg=queued_expected,
        timeout=8000,
    )

    probe=first.evaluate("async () => await window.__PA_RESILIENCE__.probeCurrent()")
    if not probe.get("pass"):
        raise AssertionError(f"source-tab save failed: {probe}")

    second.wait_for_function(
        "(expected) => window.__PA_RESILIENCE__?.summary()?.current?.hintsUsed >= expected",
        arg=probe["expected"],
        timeout=8000,
    )
    second.evaluate("async () => await window.__PA_RESILIENCE__.waitForSync()")
    after=second.evaluate("() => window.__PA_RESILIENCE__.summary()")
    if after["current"]["hintsUsed"] != probe["expected"]:
        raise AssertionError(
            f"remote tab did not adopt exact persisted update: {after['current']} vs {probe}"
        )
    if after["current"]["updatedAt"] < probe["updatedAt"]:
        raise AssertionError("remote tab adopted an older revision")

    reverse=second.evaluate("async () => await window.__PA_RESILIENCE__.probeCurrent()")
    if not reverse.get("pass"):
        raise AssertionError(f"reverse-tab save failed: {reverse}")
    first.wait_for_function(
        "(expected) => window.__PA_RESILIENCE__?.summary()?.current?.hintsUsed >= expected",
        arg=reverse["expected"],
        timeout=8000,
    )
    first.evaluate("async () => await window.__PA_RESILIENCE__.waitForSync()")
    final=first.evaluate("() => window.__PA_RESILIENCE__.summary()")
    if final["current"]["hintsUsed"] != reverse["expected"]:
        raise AssertionError("round-trip cross-tab update diverged")

    # Explicit New Puzzle is allowed to replace the durable session.
    old_seed=final["current"]["seed"]
    first.locator("[data-game-menu]").click()
    first.get_by_role("button",name="New Puzzle",exact=True).click()
    first.wait_for_function(
        "(old) => { const current=window.__PA_RESILIENCE__?.summary()?.current; return !!current && current.seed !== old; }",
        arg=old_seed,
        timeout=30000,
    )
    new_seed=first.evaluate("() => window.__PA_RESILIENCE__.summary().current.seed")
    # Background pages may be throttled by any engine. The production contract is
    # that a tab reconciles before the user resumes it, so bring it forward and
    # explicitly await the same visibility/BFCache resync hook used in production.
    second.bring_to_front()
    second.evaluate("async () => await window.__PA_RESILIENCE__.resync()")
    second.wait_for_function(
        "(seed) => window.__PA_RESILIENCE__?.summary()?.current?.seed === seed",
        arg=new_seed,
        timeout=10000,
    )

    # Simulate a stale tab whose address bar still references the obsolete seed.
    # A reload must keep the newer durable session and normalize the URL, not
    # resurrect the obsolete puzzle merely because its old seed is in the hash.
    second.evaluate(
        "(old) => history.replaceState(history.state,'',"
        "'#/game/sudoku?seed='+encodeURIComponent(old)+'&difficulty=Easy')",
        old_seed,
    )
    second.reload(wait_until="domcontentloaded",timeout=30000)
    wait_app(second,"sudoku")
    second.wait_for_function(
        "(seed) => window.__PA_RESILIENCE__?.summary()?.current?.seed === seed",
        arg=new_seed,
        timeout=10000,
    )
    stale_reload=second.evaluate(
        "() => ({seed:window.__PA_RESILIENCE__.summary().current.seed,hash:location.hash})"
    )
    if stale_reload["seed"] != new_seed or new_seed not in stale_reload["hash"]:
        raise AssertionError(f"stale reload resurrected obsolete route: {stale_reload}")

    for page in pages:
        page.close()
    return {
        "pass": not errors,
        "transport": before1["transport"],
        "firstWrite": probe["updatedAt"],
        "secondWrite": reverse["updatedAt"],
        "replacementSeed": new_seed,
        "staleReloadPreserved": True,
        "pageErrors": errors,
    }

def exercise_offline_pwa(browser, base_url):
    context=browser.new_context(viewport={"width": 1024, "height": 768}, service_workers="allow")
    errors=[]
    page=context.new_page()
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    page.goto(f"{base_url.rstrip('/')}/#/home", wait_until="domcontentloaded", timeout=30000)
    wait_app(page)

    controlled=page.evaluate(
        """async () => {
          const registration=await navigator.serviceWorker.ready;
          if (!navigator.serviceWorker.controller) {
            await new Promise((resolve,reject) => {
              const timer=setTimeout(() => reject(new Error('controller timeout')), 10000);
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                clearTimeout(timer); resolve();
              }, {once:true});
            });
          }
          return {
            controlled:!!navigator.serviceWorker.controller,
            active:!!registration.active,
            scope:registration.scope
          };
        }"""
    )
    if not controlled["controlled"] or not controlled["active"]:
        raise AssertionError(f"service worker did not control the app: {controlled}")

    context.set_offline(True)
    page.reload(wait_until="domcontentloaded", timeout=30000)
    wait_app(page)
    offline=page.evaluate("() => ({summary:window.__PA_RESILIENCE__.summary(), title:document.title})")
    if offline["summary"]["online"] is not False:
        raise AssertionError("offline reload did not expose offline runtime state")
    if "Puzzle Arcade" not in offline["title"]:
        raise AssertionError("offline app shell did not render")

    context.set_offline(False)
    page.wait_for_function("() => window.__PA_RESILIENCE__.summary().online === true", timeout=5000)
    page.close()
    context.close()
    return {"pass":not errors,"controlled":controlled,"pageErrors":errors}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8080/")
    parser.add_argument("--browser", choices=["chromium","firefox","webkit"], default="chromium")
    args=parser.parse_args()

    report={"pass":False,"phase":18,"browser":args.browser}
    with sync_playwright() as p:
        browser=getattr(p,args.browser).launch(headless=True)
        try:
            normal=browser.new_context(
                viewport={"width": 1200, "height": 800},
                service_workers="block" if args.browser != "chromium" else "allow",
            )
            report["multiTab"]=exercise_two_tabs(
                normal,args.base_url,f"phase18-{args.browser}-broadcast"
            )
            normal.close()

            fallback=browser.new_context(
                viewport={"width": 1200, "height": 800},
                service_workers="block",
            )
            fallback.add_init_script(
                "Object.defineProperty(globalThis,'BroadcastChannel',"
                "{configurable:true,writable:true,value:undefined});"
            )
            report["storageFallback"]=exercise_two_tabs(
                fallback,args.base_url,f"phase18-{args.browser}-storage","storage-event"
            )
            fallback.close()

            if args.browser == "chromium":
                report["offlinePwa"]=exercise_offline_pwa(browser,args.base_url)
            else:
                report["offlinePwa"]={
                    "skipped":True,
                    "reason":"service-worker lifecycle automation is certified in Chromium; runtime and multi-tab behavior are certified here",
                }

            failures=[]
            for name in ["multiTab","storageFallback","offlinePwa"]:
                row=report.get(name,{})
                if row.get("pass") is False or row.get("pageErrors"):
                    failures.append({name:row})
            report["failures"]=failures
            report["pass"]=not failures
        finally:
            browser.close()

    print(json.dumps(report,indent=2))
    if not report["pass"]:
        raise SystemExit(1)

if __name__=="__main__":
    main()
