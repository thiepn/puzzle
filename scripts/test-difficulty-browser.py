#!/usr/bin/env python3
import argparse
import json
from playwright.sync_api import sync_playwright

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-url',default='http://127.0.0.1:8080/')
    parser.add_argument('--samples',type=int,default=1)
    args=parser.parse_args()
    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={"width":1280,"height":900})
        errors=[]
        page.on("pageerror",lambda exc: errors.append(str(exc)))
        page.goto(args.base_url,wait_until="networkidle")
        page.wait_for_function("() => window.__PA_DIFFICULTY_AUDIT__?.version === 13")
        result=page.evaluate("""async (samples) => {
          return await window.__PA_DIFFICULTY_AUDIT__.auditCatalog(samples);
        }""",args.samples)
        browser.close()
    summary={
        "pass":bool(result.get("pass")) and not errors,
        "version":result.get("version"),
        "games":result.get("games"),
        "samplesPerTier":result.get("samplesPerTier"),
        "errors":result.get("errors",[]),
        "pageErrors":errors,
        "tiers":{
            gid:{
                "easy":data["tiers"]["Easy"]["medianScore"],
                "medium":data["tiers"]["Medium"]["medianScore"],
                "hard":data["tiers"]["Hard"]["medianScore"],
                "hardSecondary":data["tiers"]["Hard"]["medianSecondary"],
                "separated":data.get("separated",False)
            }
            for gid,data in result.get("report",{}).items()
        }
    }
    print(json.dumps(summary,indent=2))
    if not summary["pass"]:
        raise SystemExit(1)

if __name__=="__main__":
    main()
