// gen_can_sound.js  — génère can_open.wav (son d'ouverture de canette)
const fs = require('fs');
const SR = 44100;
const DUR = 1.0;
const N = Math.floor(SR * DUR);

// Biquad IIR filter (difference equation)
function biquad(inp, b0, b1, b2, a1, a2) {
  const out = new Float64Array(inp.length);
  let x1=0,x2=0,y1=0,y2=0;
  for (let i=0;i<inp.length;i++){
    const x0=inp[i];
    const y0=b0*x0+b1*x1+b2*x2-a1*y1-a2*y2;
    out[i]=y0; x2=x1;x1=x0;y2=y1;y1=y0;
  }
  return out;
}
function hpCoeffs(fc) {
  const w=2*Math.PI*fc/SR, c=Math.cos(w), s=Math.sin(w), a=s/(2*0.707);
  const a0=1+a;
  return { b0:(1+c)/2/a0, b1:-(1+c)/a0, b2:(1+c)/2/a0, a1:-2*c/a0, a2:(1-a)/a0 };
}
function bpCoeffs(fc, Q) {
  const w=2*Math.PI*fc/SR, s=Math.sin(w), c=Math.cos(w), a=s/(2*Q);
  const a0=1+a;
  return { b0:a/a0, b1:0, b2:-a/a0, a1:-2*c/a0, a2:(1-a)/a0 };
}
function noise() { const b=new Float64Array(N); for(let i=0;i<N;i++) b[i]=Math.random()*2-1; return b; }

const samples = new Float64Array(N);

// 1) Click métallique (0–35ms) : bruit bandpass 2800Hz Q=4
(()=>{
  const {b0,b1,b2,a1,a2}=bpCoeffs(2800,4);
  const f=biquad(noise(),b0,b1,b2,a1,a2);
  for(let i=0;i<N;i++){
    const t=i/SR;
    if(t>0.035)break;
    const env=t<0.002?t/0.002:Math.exp(-(t-0.002)*180);
    samples[i]+=f[i]*env*1.2;
  }
})();

// 2) Burst de pression (5ms–220ms) : bruit HP 1200Hz
(()=>{
  const {b0,b1,b2,a1,a2}=hpCoeffs(1200);
  const f=biquad(noise(),b0,b1,b2,a1,a2);
  for(let i=0;i<N;i++){
    const t=i/SR;
    if(t<0.005||t>0.22)continue;
    const rel=t-0.005;
    const env=rel<0.012?rel/0.012:Math.exp(-(rel-0.012)*22);
    samples[i]+=f[i]*env*0.75;
  }
})();

// 3) Hiss carbonation (30ms–900ms) : bruit double HP 3500→5500Hz
(()=>{
  const h1=hpCoeffs(3500),h2=hpCoeffs(5500);
  let f=biquad(noise(),h1.b0,h1.b1,h1.b2,h1.a1,h1.a2);
  f=biquad(f,h2.b0,h2.b1,h2.b2,h2.a1,h2.a2);
  for(let i=0;i<N;i++){
    const t=i/SR;
    if(t<0.030||t>0.90)continue;
    const rel=t-0.030;
    const env=rel<0.015?rel/0.015:Math.exp(-rel*5.5);
    samples[i]+=f[i]*env*0.50;
  }
})();

// Normalize
let mx=0; for(let i=0;i<N;i++) mx=Math.max(mx,Math.abs(samples[i]));
for(let i=0;i<N;i++) samples[i]/=mx*1.08;

// Write WAV
function writeWAV(path, data, sr) {
  const nSamples=data.length, nBytes=nSamples*2;
  const buf=Buffer.alloc(44+nBytes);
  buf.write('RIFF',0); buf.writeUInt32LE(36+nBytes,4); buf.write('WAVE',8);
  buf.write('fmt ',12); buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20);
  buf.writeUInt16LE(1,22); buf.writeUInt32LE(sr,24); buf.writeUInt32LE(sr*2,28);
  buf.writeUInt16LE(2,32); buf.writeUInt16LE(16,34);
  buf.write('data',36); buf.writeUInt32LE(nBytes,40);
  for(let i=0;i<nSamples;i++) buf.writeInt16LE(Math.round(Math.max(-1,Math.min(1,data[i]))*32767),44+i*2);
  fs.writeFileSync(path,buf);
}

writeWAV('can_open.wav', samples, SR);
console.log('✅ can_open.wav generated');
