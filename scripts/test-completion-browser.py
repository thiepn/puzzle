#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def compact(row):
    canonical=row.get("canonical",{})
    hint=row.get("hint",{})
    return {
        "pass":row.get("pass"),
        "seed":row.get("seed"),
        "solvable":canonical.get("ok"),
        "method":canonical.get("method"),
        "evidence":canonical.get("evidence"),
        "canonicalError":canonical.get("error"),
        "startsUnfinished":row.get("startsUnfinished"),
        "hintValid":hint.get("ok"),
        "hintKind":hint.get("kind"),
        "hintError":hint.get("error"),
    }

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-url',default='http://127.0.0.1:8080/')
    parser.add_argument('--samples',type=int,default=1)
    parser.add_argument('--games',default='')
    parser.add_argument('--output',default='')
    args=parser.parse_args()
    games=[x.strip() for x in args.games.split(',') if x.strip()] or None

    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={"width":1280,"height":900})
        page_errors=[]
        page.on("pageerror",lambda exc: page_errors.append(str(exc)))
        page.goto(args.base_url,wait_until="networkidle")
        page.wait_for_function("() => window.__PA_COMPLETION_AUDIT__?.version === 16")
        result=page.evaluate("""async ({samples,games}) => await window.__PA_COMPLETION_AUDIT__.auditCatalog(samples,games)""",{"samples":args.samples,"games":games})
        browser.close()

    report={}
    for gid,g in result.get("report",{}).items():
        tiers={}
        for tier,data in g.get("tiers",{}).items():
            tiers[tier]={
                "pass":data.get("pass"),
                "samples":[compact(x) for x in data.get("samples",[])]
            }
        report[gid]={"pass":g.get("pass"),"method":g.get("method"),"tiers":tiers}
    summary={
        "pass":bool(result.get("pass")) and not page_errors,
        "version":result.get("version"),
        "games":result.get("games"),
        "samplesPerTier":result.get("samplesPerTier"),
        "certifications":result.get("certifications"),
        "errors":result.get("errors",[]),
        "pageErrors":page_errors,
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
