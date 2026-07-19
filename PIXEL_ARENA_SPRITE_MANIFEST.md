# Projekt Ji 像素竞技场：独立资源包 v1

## 审核总览

![潮汐遗迹精灵资源总览](assets/pixel-arena/tide-ruins-sprite-contact-sheet-v1.png)

本包是“潮汐遗迹”2D 倾斜像素战场的第一批独立资源原型。它不改动 HTML、JS、CSS、地图数据或任何战斗规则。

## 可直接使用的 PNG

下列 PNG 都已去除生成时的洋红背景，具备透明通道，可作为 `img`、`background-image` 或 Canvas/WebGL 纹理使用。建议保持 `image-rendering: pixelated`，并按整数倍缩放。

| 文件 | 显示尺寸 | 对应地图语义 | 状态 |
| --- | ---: | --- | --- |
| `assets/pixel-arena/sprites/hex-floor-v1.png` | 96 x 84 | 普通六边形石砖格 | 可直接使用 |
| `assets/pixel-arena/sprites/terrain-tall-grass-v1.png` | 104 x 96 | 草丛 / 隐匿格 | 可直接使用 |
| `assets/pixel-arena/sprites/terrain-boulder-v1.png` | 96 x 112 | 巨石 / 不可进入格 | 可直接使用 |
| `assets/pixel-arena/sprites/objective-altar-idle-v1.png` | 128 x 112 | 中央据点 | 可直接使用 |
| `assets/pixel-arena/sprites/energy-crystal-v1.png` | 64 x 96 | 能量点 | 可直接使用 |
| `assets/pixel-arena/sprites/hazard-flame-v1.png` | 64 x 64 | 火焰危险格 | 可直接使用 |
| `assets/pixel-arena/sprites/overlay-move-blue-v1.png` | 96 x 84 | 可移动格蓝色高亮 | 可直接使用 |
| `assets/pixel-arena/sprites/overlay-attack-red-v1.png` | 96 x 84 | 攻击目标红色高亮 | 可直接使用 |
| `assets/pixel-arena/sprites/overlay-selected-gold-v1.png` | 96 x 84 | 当前选中格金色高亮 | 可直接使用 |

### 叠放方式

1. 先渲染 `hex-floor-v1.png`。
2. 草丛、巨石、祭坛、水晶和火焰作为同格上层覆盖。
3. 薄墙再覆盖于两个格子的共享边。
4. 蓝、红、金高亮覆盖层置于地形与单位之间，防止遮住单位。

草丛资源采用整格高草构图，边缘带不规则草叶。相邻草格渲染时允许约 4px 的相互覆盖，以形成连续草地，不留地砖空缝。

## 有明确限制的原型

| 文件 | 当前状态 | 后续需要 |
| --- | --- | --- |
| `assets/pixel-arena/sprites/thin-wall-edge-ew-v1.png` | 已是透明独立 PNG，但只有一条横向低矮石墙原型 | 需要基于同一风格补齐六边形六个边方向，或由渲染层进行无模糊旋转 |

本轮没有制作悬崖外沿、水流、完整的六方向薄墙、据点占领态、能量水晶闪烁帧、火焰循环帧、角色像素精灵或攻击特效。这些不影响本资源包作为地形风格审核和首批渲染接入验证，但在正式替换完整战场前应补齐。

## 保留的生成源

`assets/pixel-arena/sprites/source/` 内保留三张洋红背景的生成源图，以及对应的 alpha 中间图，便于以后重新裁切或调整尺寸。游戏渲染不应引用该目录；请引用上表中的 `sprites/*.png` 成品。

## 生成方式

- 石砖、草丛与地形物件：根据已确认的 v2 潮汐遗迹方向生成，再裁切为固定尺寸 PNG。
- 行动高亮：以透明底的确定性像素边框绘制，避免生成模型引入难辨的装饰纹理。
- 总览图：由本包实际导出 PNG 组合生成，不是单独的概念渲染。
