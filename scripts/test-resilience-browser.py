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

    for page in pages:
        page.close()
    return {
        "pass": not errors,
        "transport": before1["transport"],
        "firstWrite": probe["updatedAt"],
        "secondWrite": reverse["updatedAt"],
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
