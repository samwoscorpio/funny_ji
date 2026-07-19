/* Static presentation data for heroes. Combat definitions stay in game.js. */
(function registerHeroRegistry(root) {
  root.JiHeroRegistry = Object.freeze({
    lore: Object.freeze({
      classic: "旧港的钟声停在午夜以后，仍有人听见武者在雾里练刀。每一次出手，都像在回应海底某个沉睡意志的拍掌声。",
      priest: "牧师守着一座没有门的礼拜堂。祷文写在盐渍的墙上，所有被治愈的人都梦见过同一只从云层后睁开的眼。",
      elf: "精灵从不把光称作恩赐。那些在古树下流动的光环，是星海退潮时遗留的呼吸；被它祝福的人，也会被它记住。",
      assassin: "刺客从不留下脚印，只留下潮湿的黑羽与忽然熄灭的灯。有人说他的 Ji 不是蓄力，而是在向暗处归还名字。",
      vampire: "吸血鬼的城堡不在山上，而在镜子的背面。每一道伤口都是邀请，每一次回复都让月光更像血。",
      vaingloriousWarrior: "虚荣勇士听见深海观众的喝彩才会拔剑。他的荣耀越响，盔甲内侧那些细小的触须就越安静。",
      werewolf: "狼人记不清第一次变身的夜晚，只记得月亮裂成两半。狂暴时，他不是失去理智，而是终于听懂了远古的吼声。",
      iceSorcerer: "冰法收集的不是冰，而是星星死亡后的碎屑。碎片满溢时，敌人会短暂看见宇宙尽头冻结的王座。",
      mage: "法师把雷声藏进袖口，防御时收拢云层，出手时让天空在掌心短暂破裂。",
      astrologer: "占星家不预测未来，他只把未来从天上拽下来。那些坠落的鬼刀，来自一颗不该被命名的黑星。",
      dancer: "舞女的步伐写成螺旋，观者越想逃离，越会跟着节拍走向中央。她微笑时，地板下会响起第二支乐队。",
      hunter: "猎人追踪的猎物早已死去多年，但足迹每天都会更新。他的箭矢命中后会回到手中，像深林里不肯结束的回声。",
      ninja: "忍者把影子折成细小的星刃。被他盯上的人会先失去方向，再听见黑暗里传来金属回旋的低响。",
      puppet: "木偶的线并不通向天花板，而是垂入舞台下方的深井。它倒下时，井底会有另一双手慢慢把线重新系紧。",
      pharmacist: "药师的药柜里没有标签，只有潮湿的星图。瓶中液体偶尔会自己转向，仿佛深渊里的病人正隔着玻璃呼吸。",
      paladin: "圣骑士的盾牌来自一艘沉没圣船的舱门。每当敌意落在他身上，门后便传来潮湿的圣歌，催促所有刀锋转向同一个名字。",
      battleMage: "战法把火焰写成会回头的符号。每一次命中，烈焰炫纹都会从敌人的伤口里折返，像一枚枚重新归队的赤色星环。",
      gunner: "枪炮师拆开过太多敌人的法术残响。那些偷来的弹道被锁进炮台，等下一次雷声响起时，连施法者也认不出自己的火力。",
      battery: "聚气师把每一次呼吸都存进铜制罗盘。罗盘指针从不指北，只指向下一次即将被夺走的机会。",
      balancedBot: "平衡bot来自一间无人承认存在的实验室。它的算法追求公平，直到公平本身开始长出眼睛。",
      woodendummy: "wood原本只是练功桩，直到某夜潮水漫进武馆。现在每一道木纹都像闭合的嘴，等待有人再拍一下 Ji。",
      guard: "铁壁站在旧城门前太久，城门已经腐烂，他却仍在防守。盾牌背面刻着一行小字：不要听门后的海声。",
      breaker: "破阵手相信所有阵法都有裂缝。后来他发现天空也是阵法，而星辰之间的裂缝正缓慢扩大。",
    }),
    avatars: Object.freeze({
      elf: "./pic/elf.png", classic: "./pic/pixel-4.png", assassin: "./pic/assassin.png", astrologer: "./pic/astrologer.png",
      guard: "./pic/guard.png", hunter: "./pic/hunter.png", iceSorcerer: "./pic/icesorcerer.png", ninja: "./pic/ninja.png",
      pharmacist: "./pic/pharmacist.png", priest: "./pic/priest.png", vaingloriousWarrior: "./pic/vaingloriouswarrior.png", vampire: "./pic/vampire.png",
      werewolf: "./pic/werewolf1.png", werewolfBerserk: "./pic/werewolf2.png", dancer: "./pic/dancer.png", woodendummy: "./pic/wood.png",
      paladin: "./pic/paladin.png", balancedBot: "./pic/bot1.png", puppet: "./pic/puppet.png", gunner: "./pic/gunner.png",
      battleMage: "./pic/battlemage.png", battery: "./pic/battery.png", mage: "./pic/mage.png", breaker: "./pic/breaker.png",
    }),
  });
}(typeof globalThis !== "undefined" ? globalThis : this));
