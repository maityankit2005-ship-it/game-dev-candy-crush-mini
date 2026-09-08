const SIZE=8, TYPES=6;
const board=document.getElementById("board"), scoreEl=document.getElementById("score");
const movesEl=document.getElementById("moves"), msg=document.getElementById("message");
let grid=[], selected=null, score=0, moves=30, busy=false;

function randomCandy(){return Math.floor(Math.random()*TYPES)}

function hasInitialMatch(){
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    if(c>=2 && grid[r][c]===grid[r][c-1] && grid[r][c]===grid[r][c-2]) return true;
    if(r>=2 && grid[r][c]===grid[r-1][c] && grid[r][c]===grid[r-2][c]) return true;
  }
  return false;
}
function newGame(){
  score=0;moves=30;selected=null;busy=false;
  do{grid=Array.from({length:SIZE},()=>Array.from({length:SIZE},randomCandy))}while(hasInitialMatch());
  update();render();msg.textContent="Swap two candies to start!";
}
function render(){
  board.innerHTML="";
  grid.forEach((row,r)=>row.forEach((v,c)=>{
    const el=document.createElement("button");
    el.className=`candy c${v}`;
    el.dataset.r=r;el.dataset.c=c;
    el.setAttribute("aria-label",`Candy ${v+1}, row ${r+1}, column ${c+1}`);
    el.addEventListener("click",()=>pick(r,c));
    board.appendChild(el);
  }));
  if(selected){
    const i=selected.r*SIZE+selected.c;
    board.children[i]?.classList.add("selected");
  }
}
function update(){scoreEl.textContent=score;movesEl.textContent=moves}

function pick(r,c){
  if(busy || moves<=0)return;
  if(!selected){selected={r,c};render();return}
  if(selected.r===r && selected.c===c){selected=null;render();return}
  if(Math.abs(selected.r-r)+Math.abs(selected.c-c)!==1){
    selected={r,c};render();return;
  }
  swap(selected,{r,c});
}

async function swap(a,b){
  busy=true;selected=null;
  [grid[a.r][a.c],grid[b.r][b.c]]=[grid[b.r][b.c],grid[a.r][a.c]];
  render();
  const matches=findMatches();
  if(matches.size===0){
    await wait(180);
    [grid[a.r][a.c],grid[b.r][b.c]]=[grid[b.r][b.c],grid[a.r][a.c]];
    msg.textContent="No match — try another swap!";
    render();busy=false;return;
  }
  moves--;update();
  await clearMatches();
  if(moves<=0)msg.textContent=`Game over! Final score: ${score}`;
  else msg.textContent="Nice match! Keep going 🍭";
  busy=false;
}

function findMatches(){
  const set=new Set();
  for(let r=0;r<SIZE;r++){
    let start=0;
    for(let c=1;c<=SIZE;c++){
      if(c<SIZE && grid[r][c]===grid[r][start])continue;
      if(c-start>=3)for(let x=start;x<c;x++)set.add(`${r},${x}`);
      start=c;
    }
  }
  for(let c=0;c<SIZE;c++){
    let start=0;
    for(let r=1;r<=SIZE;r++){
      if(r<SIZE && grid[r][c]===grid[start][c])continue;
      if(r-start>=3)for(let x=start;x<r;x++)set.add(`${x},${c}`);
      start=r;
    }
  }
  return set;
}
async function clearMatches(){
  while(true){
    const matches=findMatches(); if(!matches.size)break;
    score+=matches.size*10;
    matches.forEach(key=>{const [r,c]=key.split(",").map(Number);grid[r][c]=null});
    update();render();await wait(220);
    for(let c=0;c<SIZE;c++){
      let write=SIZE-1;
      for(let r=SIZE-1;r>=0;r--)if(grid[r][c]!==null){grid[write][c]=grid[r][c];write--}
      while(write>=0){grid[write][c]=randomCandy();write--}
    }
    render();await wait(220);
  }
  update();
}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
document.getElementById("restart").addEventListener("click",newGame);
newGame();
