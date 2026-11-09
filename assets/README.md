# 把 Lux3D 导出的 glb 放这里

例如：

```
public/assets/
├─ gate.glb        山门
├─ ding.glb        丹房（铜鼎）
├─ sword.glb       剑冢
├─ realm.glb       秘境
└─ tribulation.glb 渡劫台
```

放好之后，去 **`assets/manifest.js`** 填表（文件名 / 缩放 / 朝向），然后：

```powershell
$node = 'C:\Users\18007\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
$pnpm = 'C:\Users\18007\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs'
& $node $pnpm dev          # 本地看效果（双击 html 是加载不了 glb 的）
& $node $pnpm standalone   # 打包时会把这里的资产一起复制到 dist/assets/
```

注意：

- 单位用**米**，正面朝 **+Z**，底面在 **y = 0**（加载器会自动居中 + 贴地）
- 单件 ≤ 2 万三角面，贴图 ≤ 2048，整套 ≤ 15 万面（手机要能跑）
- 详细说明见 `docs/04-assembly-guide.md`
