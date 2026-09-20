#!/usr/bin/env python3
import argparse
import json
from playwright.sync_api import sync_playwright

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-url',default='http://127.0.0.1:8080/')
    parser.add_argument('--steps',type=int,default=3)
    args=parser.parse_args()
    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={"width":1280,"height":900})
        page_errors=[]
        page.on("pageerror",lambda exc: page_errors.append(str(exc)))
        page.goto(args.base_url,wait_until="networkidle")
        page.wait_for_function("() => window.__PA_VARIETY_AUDIT__?.version === 14")
        result=page.evaluate("""async (steps) => await window.__PA_VARIETY_AUDIT__.auditCatalog(steps)""",args.steps)
        browser.close()
    summary={
        "pass":bool(result.get("pass")) and not page_errors,
        "version":result.get("version"),
        "games":result.get("games"),
        "steps":result.get("steps"),
        "errors":result.get("errors",[]),
        "pageErrors":page_errors,
        "gamesReport":{
            gid:{
                "pass":row.get("pass"),
                "uniqueContent":row.get("uniqueContent"),
                "nearRepeats":row.get("nearRepeats"),
                "averageNovelty":row.get("averageNovelty")
            }
            for gid,row in result.get("report",{}).items()
        }
    }
    print(json.dumps(summary,indent=2))
    if not summary["pass"]:
        raise SystemExit(1)

if __name__=="__main__":
    main()
