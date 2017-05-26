import Tone from 'tone';
import m from 'mithril';
require('./style.css');
const samples = [
  require('./samples/1.ogg'),
  require('./samples/2.ogg'),
  require('./samples/3.ogg'),
  require('./samples/4.ogg'),
  require('./samples/5.ogg'),
  require('./samples/6.ogg'),
  require('./samples/7.ogg'),
  require('./samples/8.ogg'),
];

function random(min, max) {
  return min + Math.random() * (max - min);
}

const reverb = new Tone.JCReverb(0.9);
const delay = new Tone.FeedbackDelay(0.5, 0.3);
Tone.Master.chain(delay, reverb);

const analyser = new Tone.Analyser('fft', 128);
const highpass = new Tone.Filter(3500, 'highpass');
reverb.chain(highpass, analyser);

const samplers = samples.map((url) => new Tone.Sampler(url).toMaster()});

function fire() {
  const index = Math.floor(Math.random() * samplers.length);
  const sampler = samplers[index];
  sampler.triggerAttack(random(-0.25, +0.25));
  scheduleNext();
  drops.push({
    x: ((index / (samples.length + 1)) * 100) + random(-1, +1),
    y: 0,
    dy: random(-1, +1),
    life: 1,
    depth: random(1, 3),
  });
}

function scheduleNext() {
  setTimeout(fire, random(1000, 1900));
}

scheduleNext();

let animationValue = 0;
let drops = [];

function animate() {
  const data = Array.from(analyser.analyse());
  const max = Math.max.apply(null, data);
  let bin = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i] >= max) {
      bin = i;
      break;
    }
  }
  animationValue = (animationValue * 0.8) + (bin * 0.2);
  requestAnimationFrame(() => m.redraw());
  const dropDivs = [];
  const newDrops = [];
  for (let i = 0; i < drops.length; i++) {
    const drop = drops[i];
    drop.life *= 0.97;
    if (drop.life <= 0.1) continue;
    newDrops.push(drop);
    drop.y += drop.dy;
    drop.dy *= 0.99;
    dropDivs.push(
      m(
        'div.drop',
        {
          style: `left: ${drop.x}vw; top: ${50 + drop.y}vh; opacity: ${drop.life}; filter: blur(${drop.depth}vmin);`
        }
      )
    );

  }
  drops = newDrops;

  return [
    m('.bg', {style: `opacity: ${(animationValue * 1.7) / data.length}`}),
    dropDivs,
  ];
  //Array.from(data).map(
  //  (value, i) => m('div', {style: `width: ${value}px;height:5px;background:${value === max ? 'red' : '#000'}`}, 'x')
  //)
}
m.mount(document.body, {view: animate});
