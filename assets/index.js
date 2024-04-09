var M_WIDTH=360, M_HEIGHT=800;
var app ={stage:{},renderer:{}},game_res, game, objects={}, LANG = 0, some_process={};

const LEVEL_DATA=[
	{time:60,score:2000,opened:1,best:99999},
	{time:90,score:3000,opened:0,best:99999},
	{time:120,score:5000,opened:0,best:99999},
	{time:180,score:8000,opened:0,best:99999},
	{time:240,score:9000,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999},
	{time:300,score:9500,opened:0,best:99999}
]

irnd = function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: Array(30).fill(null),
			
	any_on() {		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;			
	},
	
	linear(x) {
		return x
	},
	
	kill_anim(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj){
					this.slot[i].p_resolve('finished');		
					this.slot[i].obj.ready=true;					
					this.slot[i]=null;	
				}
	
	},
	
	flick(x){
		
		return Math.abs(Math.sin(x*6.5*3.141593));
		
	},
	
	easeBridge(x){
		
		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1		
	},
	
	ease3peaks(x){

		if (x < 0.16666) {
			return x / 0.16666;
		} else if (x < 0.33326) {
			return 1-(x - 0.16666) / 0.16666;
		} else if (x < 0.49986) {
			return (x - 0.3326) / 0.16666;
		} else if (x < 0.66646) {
			return 1-(x - 0.49986) / 0.16666;
		} else if (x < 0.83306) {
			return (x - 0.6649) / 0.16666;
		} else if (x >= 0.83306) {
			return 1-(x - 0.83306) / 0.16666;
		}		
	},
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutBack2(x) {
		return -5.875*Math.pow(x, 2)+6.875*x;
	},
	
	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad(x) {
		return x * x;
	},
	
	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic(x) {
		return x * x * x;
	},
	
	ease2back(x) {
		return Math.sin(x*Math.PI);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake(x) {
		
		return Math.sin(x*2 * Math.PI);	
		
	},	
	
	add (obj, params, vis_on_end, time, func, block=true) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {
				
				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back' || func === 'shake' || func === 'ease3peaks')
					for (let key in params)
						params[key][1]=params[key][0];				
					
				this.slot[i] = {
					obj,
					block,
					params,
					vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
		
	process(delta) {
		
		for (let i = 0; i < this.slot.length; i++) {
			if (this.slot[i]) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed*delta;	
				
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
									
					s.obj.visible=s.vis_on_end;
					if (!s.vis_on_end)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	},
	
	async wait(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
	}
}

sound={	
	
	on : 1,
	
	play(snd_res,is_loop) {
		
		if (!this.on||document.hidden)
			return;
		
		if (!gres[snd_res]?.data)
			return;
		
		gres[snd_res].sound.play({loop:is_loop||false});	
		
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
			objects.sound_switch.texture=objects.sound_switch2.texture=gres.switch_off.texture;
			
		} else{
			this.on=1;
			objects.sound_switch.texture=objects.sound_switch2.texture=gres.switch_on.texture;
		}	
		sound.play('click');
	}
	
}

music={
	
	on:1,
	
	activate(){
		
		if (!this.on||!gres.music) return;

		if (!gres.music.sound.isPlaying){
			gres.music.sound.play();
			gres.music.sound.loop=true;
		}
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
			gres.music?.sound.stop();
			objects.music_switch.texture=objects.music_switch2.texture=gres.switch_off.texture;
			
		} else{
			this.on=1;
			gres.music?.sound.play();
			objects.music_switch.texture=objects.music_switch2.texture=gres.switch_on.texture;
		}
		sound.play('click');
	}
	
}

class bubble_class extends PIXI.Container{
	
	constructor(){
		super();
		
		this.spd=4;	
		this.prv_texture_update=0;
		this.cur_texture=0;
		
		this.shell=new PIXI.Sprite(gres.shell0.texture);
		this.shell.anchor.set(0.5,0.5);
		
		this.prize=new PIXI.Sprite(gres.prize0.texture);
		this.prize.anchor.set(0.5,0.5);		
		this.prize.interactive=true;		
		this.prize.pointerdown=this.pdown.bind(this);
		
		this.addChild(this.prize,this.shell);
		
	}
	
	pdown(){
		
		if (this.shell.visible){
			sound.play('shell');
			anim2.add(this.shell,{scale_xy:[1,1.5],alpha:[1,0]}, false, 0.1,'linear');			
			return;
		}
		
		//забираем приз
		this.prize.visible=false;		
		game.prize_taken();
		
	}
	
	process(){
		
		//не обрабатываем невидимые шары
		if (!this.visible) return;
		
		//двигаем вниз
		this.y+=this.spd*main_loop.delta;
		if (this.y>800+this.height)
			this.visible=false;
		
		//анимация шара
		const tm=Date.now();
		if (tm-this.prv_texture_update>100){
			this.cur_texture++;
			this.cur_texture=this.cur_texture%5;
			this.shell.texture=gres['shell'+this.cur_texture].texture;
			this.prv_texture_update=tm;
		}		
	}
	
}

class level_icon_class extends PIXI.Container{
	
	constructor(level){
		super();		
		
		this.bcg=new PIXI.Sprite(gres.locked_level.texture);
		this.bcg.width=this.bcg.height=70;
				
		this.level=level;
		
		this.t_level=new PIXI.BitmapText(level.toString(), {fontName: 'mfont',fontSize: 50,align: 'center'});
		this.t_level.anchor.set(0.5,0.5);
		this.t_level.tint=0xff0000;
		this.t_level.x=this.bcg.width*0.5;
		this.t_level.y=this.bcg.height*0.5;		
		
		this.interactive=true;
		
		this.addChild(this.bcg);
		
	}	
	
	pointerdown(){
		
		levels_menu.level_down(this.level);		
		
	}
	
}

class level_icon_best_class extends PIXI.Container{
	
	constructor(level){
		super();		
		
		this.bcg=new PIXI.Sprite(gres.locked_level.texture);
		this.bcg.width=this.bcg.height=65;
				
		this.level=level;
		
		this.t_level=new PIXI.BitmapText(level.toString(), {fontName: 'mfont',fontSize: 30,align: 'center'});
		this.t_level.anchor.set(0.5,0.5);
		this.t_level.tint=0xffff00;
		this.t_level.x=this.bcg.width*0.5;
		this.t_level.y=this.bcg.height+3;		
		
		this.addChild(this.bcg,this.t_level);		
	}		
	
}

game={

	prv_bubble_time:0,
	score:0,
	cur_level:0,
	sec_passed:0,
	prv_tm:0,
	on:0,

	activate(level) {			
	
		
		this.cur_level=level;
	
		//фон
		objects.bcg.texture=gres['game'+irnd(0,4)].texture;		
		
		objects.t_target.text=`Level ${this.cur_level+1}\nTarget score: ${LEVEL_DATA[this.cur_level].score}`;
			
		anim2.add(objects.game_control_cont,{y:[-100,objects.game_control_cont.sy]}, true, 0.4,'linear');	
		for (let bubble of objects.bubbles) bubble.visible=false;
		some_process.game=this.process.bind(game);
		this.cur_level=level;
		
		//таймер
		this.prv_tm=Date.now();
		this.sec_passed=0;
		objects.timer_text.text=this.sec_to_time(LEVEL_DATA[this.cur_level].time);
		objects.timer_text.tint=0xffffff;
		
		this.score=0;
		objects.score_text.text=this.score;
		this.on=1;
		
	},
	
	stop(result){
		
		this.on=0;
		some_process.game=function(){};
				
		if (result==='victory'){	
		
			sound.play('win');
			const next_level=this.cur_level+1;
			
			//если есть след уровень то токрываем его
			if (next_level<LEVEL_DATA.length)
				LEVEL_DATA[next_level].opened=1;
			
			//проверяем и записываем лучшие значения
			const best=LEVEL_DATA[this.cur_level].best
			if (this.sec_passed<best){				
				LEVEL_DATA[this.cur_level].best=this.sec_passed;
				const best_results = LEVEL_DATA.map(item => item.best);
				
				//записываем в localStorage
				try{
					localStorage.setItem("bon_bubbles_best", JSON.stringify(best_results));					
				} catch(e){}
			}
			
			//анимация
			objects.lock_screen.visible=true;
			anim2.add(objects.victory_cont,{y:[800,objects.victory_cont.sy]}, true, 0.3,'linear');		
		}
		
		if (result==='game_over'){		
			sound.play('lose');
			objects.lock_screen.visible=true;
			anim2.add(objects.game_over_cont,{y:[800,objects.game_over_cont.sy]}, true, 0.3,'linear');		
		}
		
	},
	
	sec_to_time(seconds) {
		
	  const minutes = Math.floor(seconds / 60);
	  const remainingSeconds = seconds % 60;
	  
	  const formattedMinutes = String(minutes).padStart(1, '0');
	  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
	  
	  return `${formattedMinutes}:${formattedSeconds}`;
	},	

	prize_taken(){
		
		if(!this.on) return;
		
		sound.play('prize');
		this.score+=100;
		objects.score_text.text=this.score;
		
		if (this.score>=LEVEL_DATA[this.cur_level].score)
			this.stop('victory');		
	
	},
	
	pause_down(){
		
		if (anim2.any_on()||objects.pause_cont.visible||!this.on) return;		
		this.on=0;
		
		sound.play('click');
		some_process.game=function(){};
		
		//
		objects.lock_screen.visible=true;
		anim2.add(objects.pause_cont,{y:[800,objects.pause_cont.sy]}, true, 0.3,'linear');
		
	},
	
	resume_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		this.on=1;
		some_process.game=game.process.bind(game);
		
		//
		objects.lock_screen.visible=false;
		anim2.add(objects.pause_cont,{y:[objects.pause_cont.y,800]}, false, 0.3,'linear');
		
	},
	
	exit_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		objects.lock_screen.visible=false;
		
		if (objects.pause_cont.visible)
			anim2.add(objects.pause_cont,{y:[objects.pause_cont.y,800]}, false, 0.3,'linear');
		
		if (objects.game_over_cont.visible)
			anim2.add(objects.game_over_cont,{y:[objects.game_over_cont.y,800]}, false, 0.3,'linear');
		
		if (objects.victory_cont.visible)
			anim2.add(objects.victory_cont,{y:[objects.victory_cont.y,800]}, false, 0.3,'linear');
		
		this.close();
		main_menu.activate();
		
	},
	
	restart_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		objects.lock_screen.visible=false;		
		
		if (objects.victory_cont.visible)
			anim2.add(objects.victory_cont,{y:[objects.victory_cont.y,800]}, false, 0.3,'linear');	
		
		if (objects.game_over_cont.visible)
			anim2.add(objects.game_over_cont,{y:[objects.game_over_cont.y,800]}, false, 0.3,'linear');	
		
		this.activate(this.cur_level);
	},
	
	next_level_down(){
		
		if (anim2.any_on()) return;
		//
		this.cur_level++;		
		
		sound.play('click');
		objects.lock_screen.visible=false;
		anim2.add(objects.victory_cont,{y:[objects.victory_cont.y,800]}, false, 0.3,'linear');	
		this.activate(this.cur_level);
		
	},
	
	add_new_bubble(){
		
		for (let bubble of objects.bubbles){
			if (!bubble.visible){
				bubble.visible=true;
				bubble.shell.visible=true;
				bubble.shell.scale_xy=1;
				bubble.prize.visible=true;
				bubble.y=-bubble.height*0.5;
				bubble.x=irnd(bubble.width*0.5,360-bubble.width*0.5);		
				bubble.prize.texture=gres['prize'+irnd(0,5)].texture;
				return;
			}				
		}	
	},
	
	process(){
		
		const tm=Date.now();
		//добавляем новые шары
		if (tm>this.prv_bubble_time+600){			
			this.add_new_bubble();
			this.prv_bubble_time=tm;		
		}
		
		//таймер
		if (tm>this.prv_tm+1000){
			this.sec_passed++;
			this.prv_tm=tm;
			const sec_left=LEVEL_DATA[this.cur_level].time-this.sec_passed;
			
			if (sec_left===5){
				sound.play('clock');
				objects.timer_text.tint=0xff4444;
			}
			
			if (sec_left<=0) this.stop('game_over');	
			objects.timer_text.text=this.sec_to_time(sec_left);
		}			
		
		//обрабатываем шары
		for (let bubble of objects.bubbles) bubble.process();

	},
	
	async close(){
		
		some_process.game=function(){};
		anim2.add(objects.game_control_cont,{y:[objects.game_control_cont.y,-100]}, false, 0.4,'linear');	
		for (let bubble of objects.bubbles) bubble.visible=false;
		
		main_menu.activate();
		
	}
	
	
}

rules={	
	
	activate(){
		
		//фон
		objects.bcg.texture=gres.rules_bcg.texture;	
		
		objects.lock_screen.visible=true;
		anim2.add(objects.rules,{y:[-800,objects.rules.sy]}, true, 0.35,'linear');	
		
	},
	
	back_button_down(){
		
		if (anim2.any_on()) return;	
		sound.play('click');
		this.close();
		main_menu.activate();		
	},
	
	close(){		
		objects.lock_screen.visible=false;
		anim2.add(objects.rules,{y:[objects.rules.y,800]}, false, 0.35,'linear');			
	}
		
}

main_menu={

	activate() {		
		
		//игровой титл
		objects.bcg.texture=gres.main_menu.texture;	
		anim2.add(objects.logo,{y:[-200,objects.logo.sy]}, true, 0.5,'easeOutBounce');			
		anim2.add(objects.main_buttons_cont,{y:[-600,objects.main_buttons_cont.sy]}, true, 0.5,'easeOutBack');			
		anim2.add(objects.best_results_button,{x:[400,objects.best_results_button.sx]}, true, 0.3,'easeOutBack');
		some_process.main_menu=function(){main_menu.process()};

	},

	close() {
		
		some_process.main_menu=function(){};
		anim2.add(objects.logo,{y:[objects.logo.y,-200]}, false, 0.5,'linear');			
		anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.y,1000]}, false, 0.5,'linear');			
		anim2.add(objects.best_results_button,{x:[objects.best_results_button.x,400]}, false, 0.3,'linear');	
	},
	
	best_results_down(){
		
		if (anim2.any_on()) return;
		
		sound.play('click');
		this.close();
		best_results.activate();		
	},
	
	process(){
		
		objects.logo.scale_x=Math.sin(Date.now()*0.001)*0.2+1;
		
	},

	play_down () {

		if (anim2.any_on()) return;		
		
		sound.play('click');
		this.close();
		levels_menu.activate();
	},

	rules_down(){
		
		if (anim2.any_on()) return;	
		sound.play('click');
		this.close();
		rules.activate();		
	}

}

levels_menu={
	
	activate(){
		
		anim2.add(objects.levels_icons_cont,{y:[-450,objects.levels_icons_cont.sy]}, true, 0.5,'easeOutBack');			
				
		//фон
		objects.bcg.texture=gres.levels.texture;	
		
		for (let i=0;i<objects.levels_icons.length;i++){
			
			const icon=objects.levels_icons[i];
			const opened=LEVEL_DATA[i].opened;
			if (opened)
				icon.bcg.texture=gres.opened_level.texture;
			else
				icon.bcg.texture=gres.locked_level.texture;			
		}
		
		
	},
	
	level_down(level){
		
		if (anim2.any_on()||objects.level_locked.visible) return;
		
		
		if (!LEVEL_DATA[level].opened){
			sound.play('locked');
			objects.lock_screen.visible=true;
			anim2.add(objects.level_locked,{scale_x:[0,1]}, true, 0.1,'easeOutBack');	
			return;
		}
		
		
		sound.play('click');
		this.close();
		game.activate(level);		
		
	},
	
	level_locked_down(){
		
		if (anim2.any_on()) return;	
		//закрываем предупреждение
		objects.lock_screen.visible=false;
		anim2.add(objects.level_locked,{scale_x:[1,0]}, false, 0.1,'linear');	
		
		
	},
	
	back_button_down(){
		
		if (anim2.any_on()) return;	
		this.close();
		main_menu.activate();
		
	},
	
	close(){
		
		anim2.add(objects.levels_icons_cont,{y:[objects.levels_icons_cont.y,1000]}, false, 0.4,'linear');	
		
	}
	
	
}

best_results={	
	
	activate(){	
		
		objects.lock_screen.visible=true;
		anim2.add(objects.best_results_cont,{y:[-800,objects.best_results_cont.sy]}, true, 0.35,'linear');	
		
		for (let i=0;i<objects.levels_best.length;i++){
			
			const icon=objects.levels_best[i];
			const opened=LEVEL_DATA[i].opened;
			const best=LEVEL_DATA[i].best;
			if (opened)
				icon.bcg.texture=gres.opened_level.texture;
			else
				icon.bcg.texture=gres.locked_level.texture;	

			if (best!==99999)
				icon.t_level.text=best+'s';
			else
				icon.t_level.text='n/a';
			
		}		
		
	},
	
	back_button_down(){
		
		if (anim2.any_on()) return;	
		sound.play('click');
		this.close();
		main_menu.activate();
		
	},
	
	close(){
		
		objects.lock_screen.visible=false;
		anim2.add(objects.best_results_cont,{y:[objects.best_results_cont.y,800]}, false, 0.35,'linear');	
		
	}
		
}

function resize() {
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

function vis_change() {

	if (document.hidden === true) {	
		PIXI.sound.volumeAll=0;	
	} else {
		PIXI.sound.volumeAll=1;	
	}				
		
}

async function init_game_env(lang) {

	document.body.style.webkitTouchCallout = "none";
	document.body.style.webkitUserSelect = "none";
	document.body.style.khtmlUserSelect = "none";
	document.body.style.mozUserSelect = "none";
	document.body.style.msUserSelect = "none";
	document.body.style.userSelect = "none";	
	
								
	await load_resources();	


	//создаем приложение пикси и добавляем тень
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";
	

	//события изменения окна
	resize();
	window.addEventListener("resize", resize);
	

	//создаем спрайты и массивы спрайтов и запускаем первую часть кода
	for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;

        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }
		
	//обрабатываем вторую часть кода в объектах
	for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
		
		
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;

        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }


	//загружаем лучшие параметры	
	let best_results_data=0;
	try{
		best_results_data = localStorage.getItem('bon_bubbles_best');		
	}catch(e){
		
	}
	if (best_results_data){
		best_results_data=JSON.parse(best_results_data);
		for (let i=0;i<LEVEL_DATA.length;i++){
			
			LEVEL_DATA[i].best=best_results_data[i];
			if (i<LEVEL_DATA.length-1&&LEVEL_DATA[i].best!=99999)
				LEVEL_DATA[i+1].opened=1;			
		}
	}
	
	//запускаем главный цикл
	main_loop.run(1);
	
	//это разные события
	document.addEventListener('visibilitychange', vis_change);
		
	//проверяем и включаем музыку
	music.activate();
		
	//показыаем основное меню
	main_menu.activate();	

}

async function load_resources() {


	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(30,30,130,1);flex-direction: column	}#m_progress {	  background: rgb(30, 30, 100);border:1px solid rgb(130, 130, 200);	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {border-radius: 5px;	  background: rgb(80, 80, 180);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';

	document.getElementById("m_progress").style.display = 'flex';
	
	git_src=''	
	game_res=new PIXI.Loader();
	game_res.add("m2_font", git_src+"fonts/goos/goos.fnt");
		
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++)
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/ENG/'+load_list[i].name+"."+load_list[i].image_format);		

	//добавляем фоны
	game_res.add('game0', git_src+'res/bcg/game0.png');
	game_res.add('game1', git_src+'res/bcg/game1.png');
	game_res.add('game2', git_src+'res/bcg/game2.png');
	game_res.add('game3', git_src+'res/bcg/game3.png');
	game_res.add('game4', git_src+'res/bcg/game4.png');
	
	game_res.add('best_res', git_src+'res/bcg/best_res.png');
	game_res.add('levels', git_src+'res/bcg/levels.png');
	game_res.add('main_menu', git_src+'res/bcg/main_menu.png');
	game_res.add('rules_bcg', git_src+'res/bcg/rules_bcg.png');
	
	//добавляем музыку
	game_res.add('music',git_src+'sounds/music.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('shell',git_src+'sounds/shell.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('prize',git_src+'sounds/prize.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');	
	game_res.add('clock',git_src+'sounds/clock.mp3');	
	
	//прогресс
	game_res.onProgress.add(function(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	});
	
	await new Promise((resolve, reject)=> game_res.load(resolve))

	//убираем элементы загрузки
	document.getElementById("m_progress").outerHTML="";	
	
	//короткое обращение к ресурсам
	gres=game_res.resources;

}

main_loop={	
	
	prv_time:0,
	delta:1,
	
	run(){
		
		//пересчитываем параметры фрейма
		const tm=performance.now();
		if (!this.prv_time) this.prv_time=tm-16.666;
		const frame_time=Math.min(100,tm-this.prv_time);
		main_loop.delta=frame_time/16.66666;
		
		
		this.prv_time=tm;		
							

		//обрабатываем мини процессы
		for (let key in some_process) some_process[key](main_loop.delta);	
		
		//обрабатываем анимации
		anim2.process(main_loop.delta);
		
		//отображаем сцену
		app.renderer.render(app.stage);		
		
		//вызываем следующий фрейм
		requestAnimationFrame(main_loop.run);			

	}	
	
}
