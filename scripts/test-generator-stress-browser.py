#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def compact_tier(row):
    timing=row.get("timing",{})
    retries=row.get("retries",{})
    return {
        "pass":row.get("pass"),
        "generations":row.get("generations"),
        "failures":row.get("failures"),
        "qualityRejects":row.get("qualityRejects"),
        "determinismErrors":len(row.get("determinismErrors",[])),
        "stateSharingErrors":len(row.get("stateSharingErrors",[])),
        "uniqueDigests":row.get("uniqueDigests"),
        "uniqueContent":row.get("uniqueContent"),
        "requiredUnique":row.get("requiredUnique"),
        "medianMs":timing.get("medianMs"),
        "p95Ms":timing.get("p95Ms"),
        "maxMs":timing.get("maxMs"),
        "budgetMs":timing.get("budgetMs"),
        "driftRatio":timing.get("driftRatio"),
        "fallbackRate":retries.get("fallbackRate"),
        "averageAttempts":retries.get("averageAttempts"),
        "maxAttempts":retries.get("maxAttempts"),
    }

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-url',default='http://127.0.0.1:8080/')
    parser.add_argument('--samples',type=int,default=2)
    parser.add_argument('--games',default='')
    parser.add_argument('--output',default='')
    args=parser.parse_args()
    games=[x.strip() for x in args.games.split(',') if x.strip()] or None

    with sync_playwright() as p:
        browser=p.chromium.launch(args=["--enable-precise-memory-info"])
        page=browser.new_page(viewport={"width":1280,"height":900})
        page_errors=[]
        page.on("pageerror",lambda exc: page_errors.append(str(exc)))
        page.goto(args.base_url,wait_until="networkidle")
        page.wait_for_function("() => window.__PA_GENERATOR_STRESS__?.version === 15")
        heap_before=page.evaluate("() => performance.memory?.usedJSHeapSize ?? null")
        result=page.evaluate("""async ({samples,games}) => await window.__PA_GENERATOR_STRESS__.auditCatalog(samples,games)""",{"samples":args.samples,"games":games})
        heap_after=page.evaluate("() => performance.memory?.usedJSHeapSize ?? null")
        browser.close()

    report={}
    for gid,g in result.get("report",{}).items():
        report[gid]={
            "pass":g.get("pass"),
            "errors":g.get("errors",[]),
            "tiers":{tier:compact_tier(row) for tier,row in g.get("tiers",{}).items()}
        }
    heap_delta=None if heap_before is None or heap_after is None else heap_after-heap_before
    summary={
        "pass":bool(result.get("pass")) and not page_errors,
        "version":result.get("version"),
        "games":result.get("games"),
        "samplesPerTier":result.get("samplesPerTier"),
        "generations":result.get("generations"),
        "durationMs":result.get("durationMs"),
        "failures":result.get("failures"),
        "errors":result.get("errors",[]),
        "pageErrors":page_errors,
        "heapBefore":heap_before,
        "heapAfter":heap_after,
        "heapDelta":heap_delta,
        "report":report,
    }
    encoded=json.dumps(summary,indent=2)
    print(encoded)
    if args.output:
        Path(args.output).write_text(encoded+"\n",encoding="utf-8")
    if not summary["pass"]:
        raise SystemExit(1)

if __name__=="__main__":
    main()
