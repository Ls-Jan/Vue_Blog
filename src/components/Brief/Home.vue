<script setup>

import { ElAvatar } from 'element-plus';
import { ElRow } from 'element-plus';
import { fill } from 'lodash-es';

</script>

<!-- 抓Github用户头像：https://www.coder.work/article/6500343 -->
<template>
	<div>
		<el-row>
			<div style="width:fit-content">
				<!-- 这里我真的不知道怎么回事，明明都调了fit，还是出现图片没有覆盖整个圆头像的情况，试了很多遍了不知道是哪的问题，不想搞那么多直接先背景涂白将就着算了 -->
				<el-avatar :size="100" src="https://avatars.githubusercontent.com/ls-jan" fit='fill'
					style="background-color:white;">Ls-Jan</el-avatar>
				<p>Github：<a href="https://github.com/ls-jan">https://github.com/ls-jan</a></p>
				<p>CSDN：<a href="https://blog.csdn.net/weixin_44733774">https://blog.csdn.net/weixin_44733774</a></p>
			</div>
			<div style="width: 10px;"></div>
			<div style="width:2px;background-color:#444444"></div>
			<div style="width: 10px;"></div>
			<div>
				<!-- <div style="width: 30rem;"> -->
				<p>2024年1月1日起，CSDN博客内容停止更新，跳转查看原因：<a
						href="https://blog.csdn.net/weixin_44733774/article/details/135284518">【随口一说】最近的CSDN]</a></p>

				<br>
				<p>没啥有趣的东西，页面也写的不怎么样(不时冒bug属实折磨，前端真特么难搞，</p>
				<p>越写越成坨，看哪天受不了了再重新写一份(不是直接fork一份？</p>
				<br>

				<div class="TextHide">
					<p>这个页面通过Vue3+ElementPlus纯手搓的(C++开发者特有的造轮子习惯)</p>
					<p>虽然搓到一半才想到“我为啥不下载现有的模板然后调整呢”，</p>
					<p>算了都做到这了，就当入门了解Web编程</p>
				</div>
			</div>
		</el-row>
	</div>
</template>
