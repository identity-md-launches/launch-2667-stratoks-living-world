// Read-only Git metadata audit. Never stages, commits or edits .git/.
import fs from'node:fs';import path from'node:path';import{execFileSync}from'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const changed=git('diff','--name-only','--diff-filter=AM','-z');const added=git('ls-files','--others','--exclude-standard','-z');
const paths=[...new Set([...changed,...added])].filter(p=>fs.existsSync(path.join(root,p))&&fs.statSync(path.join(root,p)).isFile());
const forbidden=p=>/(^|\/)(node_modules|\.git|\.github|\.env(?:\.[^/]*)?|\.npm|\.cache|\.vite)(\/|$)/.test(p)||/(^|\/)(foundry\.toml|foundry\.lock|remappings\.txt|\.gitmodules|package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$/.test(p)||p.startsWith('lib/');
const forbiddenChanges=paths.filter(forbidden);const unnecessaryArchives=paths.filter(p=>/\.(tgz|zip|tar)$/.test(p));
const entries=paths.map(p=>({path:p,bytes:fs.statSync(path.join(root,p)).size}));
const bytes=entries.reduce((t,p)=>t+p.bytes,0),walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const sum=d=>walk(path.join(root,d)).reduce((t,p)=>t+fs.statSync(p).size,0);
const runtimeBytes=['web/public/art','web/public/demo','dist'].reduce((t,p)=>t+sum(p),0),evidenceBytes=sum('artifacts/living-interface');
const submodules=execFileSync('git',['ls-files','--stage'],{cwd:root,encoding:'utf8'}).split('\n').filter(l=>l.startsWith('160000 '));
const report={version:1,method:'Sum of full added/modified files, ignoring deletions as savings; git diff + untracked nonignored paths.',bytes,limit:8388608,remaining:8388608-bytes,pathBudgets:{runtime:{paths:['web/public/art/**','web/public/demo/**','dist/**'],bytes:runtimeBytes,limit:6422528},evidence:{paths:['artifacts/living-interface/**'],bytes:evidenceBytes,limit:1703936}},forbiddenChanges,unnecessaryArchives,submodules,files:entries.length,largest:entries.sort((a,b)=>b.bytes-a.bytes).slice(0,12)};
const valid=bytes<=report.limit&&runtimeBytes<=6422528&&evidenceBytes<=1703936&&!forbiddenChanges.length&&!unnecessaryArchives.length&&!submodules.length;
report.status=valid?'pass':'fail';console.log(JSON.stringify(report,null,2));if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'artifacts/living-interface/delivery-audit.json'),JSON.stringify(report,null,2)+'\n');if(!valid)process.exitCode=1;
