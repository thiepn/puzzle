from pathlib import Path
import hashlib
root=Path(__file__).resolve().parent.parent
p=root/'app.js';s=p.read_text()
assert hashlib.sha256(p.read_bytes()).hexdigest()=='bad538983593ce1677134706f3d6ae941d604a7d2b12d5a168c98095af31982f'
changes=[('<button data-play-undo title=', '<button data-play-undo aria-label="Undo" title='),('<button data-play-redo title=', '<button data-play-redo aria-label="Redo" title='),("{ui.redo=[];ui.feedback='';}ui.signature=signature;", "{ui.redo=[];ui.feedback='';const feedback=$('[data-play-feedback]');if(feedback){feedback.textContent='';feedback.hidden=true;}}ui.signature=signature;")]
for old,new in changes:
    assert s.count(old)==1,old
    s=s.replace(old,new)
assert hashlib.sha256(s.encode()).hexdigest()=='ef5b592f927107cc7f799690c385f91a5aec91b88200669f934a2730bb06aee5'
p.write_text(s)
p=root/'scripts/test-play-browser.py';s=p.read_text()
old="    page.locator('[data-anagram-tile]').first.click()\n    entered=page.locator('.anagram-answer').inner_text()"
new="    tile=page.locator('[data-anagram-tile]').first\n    letter=tile.inner_text().strip()\n    tile.click()\n    page.wait_for_function('(letter)=>document.querySelector(\".anagram-answer\").textContent.trim()===letter',arg=letter)\n    entered=page.locator('.anagram-answer').inner_text()"
assert s.count(old)==1
p.write_text(s.replace(old,new))
print('Applied verified control labels, feedback cleanup, and state-based browser synchronization.')
