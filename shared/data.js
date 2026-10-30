// Sample data only. Workout = ENDURE PROGRAMMING (Nov 26 tab), Week 3, THURS: DEADS, used as "today".
// Coach ranges from "ENDURE PROGRAMMING Revamped nov 2026" > Exercise Weights Lookup (Week 3).
window.EFC = {
  day: {date:'Thu Oct 29', iso:'2026-10-29', title:'DEADS', program:'Endure Strength', time:'6:00 AM', coach:'Coach Don',
        week:3, phase:'Volume 1', reps:'10-20 reps'},
  member: {name:'Alex', since:'2024', sex:'M'},
  sides: {
    RACKS: {rest:'90-120s', restSec:105, ex:[
      {id:'r-a1', blk:'A1', name:"Assisted Child's Pose Leg Lift", rx:'2 x 10-12 each', sets:2, reps:12, unit:'bw', cue:'Controlled, full range'},
      {id:'r-a2', blk:'A2', name:'Alt Deadbug, Plate Overhead', rx:'2 x 8, 2s pause', sets:2, reps:8, unit:'lb', range:'Plate', last:{w:25,r:[8,8]}, hist:[15,20,20,25,25], cue:'Low back pressed down'},
      {id:'r-b1', blk:'B1', name:'Deadlift', rx:'3-4 x 6-8', sets:4, reps:8, unit:'lb', range:'F 75-245 / M 95-275', last:{w:205,r:[8,8,7]}, hist:[185,185,195,195,205,205], key:true, cue:'Flat back, push the floor away. 2s eccentric.'},
      {id:'r-b2', blk:'B2', name:'Deadlift Back Down', rx:'3-4 x 6, 5s hold, heels on high box', sets:4, reps:6, unit:'lb', range:'F 75-245 / M 95-275', last:{w:165,r:[6,6,6]}, hist:[145,150,155,155,165,165], cue:'5s hold, heels on high box'},
      {id:'r-c1', blk:'C1', name:'Cable Abduction', rx:'Drop set 2 x 20s / 30s / 40s', sets:2, reps:40, repLabel:'SEC', unit:'lb', range:'F 10-25 / M 15-35', last:{w:25,r:[40,40]}, hist:[15,17.5,20,20,22.5,25], cue:'Toe slightly in'}
    ]},
    FLOOR: {rest:'60-90s', restSec:75, ex:[
      {id:'f-a1', blk:'A1', name:'Monster Walks', rx:'2 x 10 forward / back', sets:2, reps:10, unit:'band', cue:'Band above knees'},
      {id:'f-a2', blk:'A2', name:'Roller Pikes', rx:'2-3 x 10-12', sets:3, reps:12, unit:'bw', cue:'2s eccentric, hips high'},
      {id:'f-b1', blk:'B1', name:'Narrow Stance Goblet Squat', rx:'3-4 x 12, 3s ecc', sets:4, reps:12, unit:'lb', range:'F 20-45 / M 35-70', last:{w:50,r:[12,12,12]}, hist:[35,40,44,44,50,50], key:true, cue:'Constant tempo, 3s eccentric'},
      {id:'f-b2', blk:'B2', name:'Walking Lunges', rx:'3 x 12 each, 2s hold, 2s ecc', sets:3, reps:12, unit:'lb', perHand:true, range:'F 15-30 / M 25-50', last:{w:30,r:[12,12,12]}, hist:[20,25,25,25,30,30], key:true, cue:'Weight per hand'},
      {id:'f-c1', blk:'C1', name:'High Box SL Hamstring Bridge', rx:'2 up 1 down, drop set 2 x 20s / 30s / 40s', sets:2, reps:40, repLabel:'SEC', unit:'bw', cue:'2 up, 1 down'}
    ]}
  },
  histLabels:['MAY','JUN','JUL','AUG','SEP','OCT 22'],
  monthVol:[{m:'MAY',v:88400},{m:'JUN',v:96100},{m:'JUL',v:104300},{m:'AUG',v:99200},{m:'SEP',v:121000},{m:'OCT',v:128400}],
  octClasses:[1,3,6,8,10,13,15,17,20,22,24,27], octPR:[15,22],
  firstSide:'RACKS'
};
EFC.all = () => [...EFC.sides.RACKS.ex.map(e=>({...e,side:'RACKS'})), ...EFC.sides.FLOOR.ex.map(e=>({...e,side:'FLOOR'}))];
EFC.byId = id => EFC.all().find(e=>e.id===id);
EFC.store = key => ({
  get(){ try{return JSON.parse(localStorage.getItem(key))||{}}catch(e){return {}} },
  set(v){ localStorage.setItem(key, JSON.stringify(v)) }
});
// sets for an exercise: from log, else prefilled from last time
EFC.setsFor = (logs, ex) => {
  if (logs[ex.id]) return logs[ex.id];
  const w = ex.last ? ex.last.w : 0;
  return Array.from({length: ex.sets}, (_, i) => ({w, r: ex.last && ex.last.r[i] != null ? Math.max(ex.last.r[i], ex.reps) : ex.reps, done:false}));
};
EFC.bestToday = (logs, ex) => { const d=(logs[ex.id]||[]).filter(s=>s.done); if(!d.length) return null; return d.reduce((a,b)=> (b.w>a.w || (b.w===a.w&&b.r>a.r))?b:a); };
EFC.prevBest = ex => ex.hist ? Math.max(...ex.hist) : 0;
EFC.volToday = logs => EFC.all().reduce((t,ex)=> t + (ex.unit==='lb' && ex.repLabel!=='SEC' ? (logs[ex.id]||[]).filter(s=>s.done).reduce((a,s)=>a+s.w*s.r*(ex.perHand?2:1),0) : 0), 0);
EFC.doneCount = (logs, ex) => (logs[ex.id]||[]).filter(s=>s.done).length;
EFC.fmt = n => n.toLocaleString('en-US');
// SVG line chart
EFC.chart = (vals, labels, w=346, h=150) => {
  const lo = Math.min(...vals) - 10, hi = Math.max(...vals) + 10;
  const xs = vals.map((_,i)=> vals.length===1?w/2: 20 + i*(w-40)/(vals.length-1));
  const ys = vals.map(v => h - (v-lo)/(hi-lo||1)*h);
  const d = 'M'+xs.map((x,i)=>x.toFixed(1)+','+ys[i].toFixed(1)).join(' L');
  const area = d+` L${xs[xs.length-1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`;
  let g=''; for(let k=0;k<4;k++) g+=`<line x1="0" x2="${w}" y1="${(h*k/3).toFixed(1)}" y2="${(h*k/3).toFixed(1)}" stroke="#1d1d1d"/>`;
  const dots = xs.map((x,i)=>`<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="${i===xs.length-1?5:3}" fill="${i===xs.length-1?'#D3B182':'#F5F2EC'}"/>`).join('');
  const lab = xs.map((x,i)=>`<text x="${x.toFixed(1)}" y="${h+18}" fill="rgba(245,242,236,.5)" font-family="DM Mono, monospace" font-size="10" text-anchor="middle">${labels[i]}</text>`).join('');
  return `<svg width="100%" viewBox="0 0 ${w} ${h+24}"><defs><linearGradient id="gg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#D3B182" stop-opacity=".35"/><stop offset="1" stop-color="#D3B182" stop-opacity="0"/></linearGradient></defs>${g}<path d="${area}" fill="url(#gg)"/><path d="${d}" fill="none" stroke="#D3B182" stroke-width="2.5"/>${dots}${lab}</svg>`;
};
EFC.spark = (vals,w=70,h=26) => { const lo=Math.min(...vals),hi=Math.max(...vals); const xs=vals.map((_,i)=>2+i*(w-4)/(vals.length-1)); const ys=vals.map(v=>h-3-(v-lo)/(hi-lo||1)*(h-6)); return `<svg width="${w}" height="${h}"><path d="M${xs.map((x,i)=>x.toFixed(1)+','+ys[i].toFixed(1)).join(' L')}" fill="none" stroke="#D3B182" stroke-width="2"/><circle cx="${xs[xs.length-1]}" cy="${ys[ys.length-1]}" r="3" fill="#D3B182"/></svg>`; };
EFC.series = (logs, ex) => { const b=EFC.bestToday(logs,ex); const v=[...ex.hist]; const l=[...EFC.histLabels]; if(b){v.push(b.w); l.push('OCT 29');} return {v,l}; };
