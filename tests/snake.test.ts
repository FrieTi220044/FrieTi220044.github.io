import {test,expect} from 'bun:test';
import {Snake} from '../src/scripts/snake';
test('eating grows snake and places food outside body',()=>{const g=new Snake(()=>0);g.food={x:8,y:10};g.tick();expect(g.score).toBe(1);expect(g.body).toHaveLength(5);expect(g.body.some(p=>p.x===g.food.x&&p.y===g.food.y)).toBe(false);});
test('reversal and multiple turns in one tick are blocked',()=>{const g=new Snake();g.turn('left');g.tick();expect(g.body[0]).toEqual({x:8,y:10});g.turn('up');g.turn('left');g.tick();expect(g.body[0]).toEqual({x:8,y:9});});
test('wall collision ends game',()=>{const g=new Snake();g.body=[{x:19,y:5}];g.tick();expect(g.over).toBe(true);});
test('self collision ends game',()=>{const g=new Snake();g.body=[{x:5,y:5},{x:5,y:6},{x:6,y:6},{x:6,y:5},{x:7,y:5}];g.tick();expect(g.over).toBe(true);});
test('moving into the vacating tail is allowed',()=>{const g=new Snake();g.body=[{x:5,y:5},{x:5,y:6},{x:6,y:6},{x:6,y:5}];g.food={x:0,y:0};g.tick();expect(g.over).toBe(false);expect(g.body[0]).toEqual({x:6,y:5});});
test('full board wins without an endless food search',()=>{const g=new Snake();g.body=[{x:18,y:19}];for(let y=0;y<20;y++)for(let x=0;x<20;x++)if(!(y===19&&(x===18||x===19)))g.body.push({x,y});g.food={x:19,y:19};g.tick();expect(g.won).toBe(true);expect(g.over).toBe(true);expect(g.body).toHaveLength(400);});
