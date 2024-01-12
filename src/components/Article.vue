




<script setup>

// import { debounce } from 'lodash-es'//防抖（不会用
import { ElDivider } from 'element-plus';
import { ElTag } from 'element-plus';
import { ElCol } from 'element-plus';
import { ElPageHeader, ElButton } from 'element-plus';
import { ElTooltip } from 'element-plus';
import { RefreshRight } from '@element-plus/icons-vue'
import TreeView from './TreeView.vue'

const props = defineProps({
	isLoading: { default: false },//内容加载状态

	cont_article: { default: '' },//传入的是html代码
	cont_tag: { default: null },//附在标题后面的Tag
	cont_refresh: { default: [] },//与刷新相关的信息，依次是：文章请求时间、XRateLimit的重置时间、XRateLimit当前剩余请求次数
	cont_meta: { default: {} },//文章元数据，与XJ_Article.data_meta对应
	click_refresh: { default: null },//点击刷新按钮的函数
	click_back: { default: null },//点击返回按钮的函数
	showHeader: { default: true },//显示标题栏
	showAddition: { default: true },//显示额外信息
});

let item = [new Date(), []];

function TransTime(time) {
	return new Date(time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

async function ItemClick(index, node) {
	if (node.childNodes.length == 0) {
		let time = new Date();
		if (item[1].toString() == index.toString()) {
			if (time - item[0] < 500) {//双击
				let rootUrl = props.cont_meta['url'].split('main/')[1];//哈哈哈哈哈我特么笑yue，什么补丁行为，不管了能用就行
				let url = ['.', rootUrl, ...index].join('/');
				let lst = rootUrl.split('.');
				let suffix = lst[lst.length - 1];
				let exclude = ['jpg', 'mp4', 'gif', 'png', 'webp', 'html']
				if (exclude.indexOf(suffix) != -1) {//媒体文件、网页，直接打开
					window.open(url);
				}
				else {//完全不知道为什么，使用window.open打开文本文件会乱码，受不了只能用这个方式处理
					//window.open详解：https://juejin.cn/post/7039917181366190110
					let resp = await fetch(url);
					let cont = await resp.text();
					let ref = window.open(url);
					ref.onload = function () {
						console.log(ref.document)
						let node = ref.document.querySelector('pre');
						node.innerText = cont;
					}
				}
			}
		}
		else {
			item[1] = index;
		}
		item[0] = time;
	}
}

</script>


<template>
	<div>
		<el-page-header title="返回" v-if="props.showHeader" @back="props.click_back ? props.click_back() : null">
			<template #content>
				<div class="flex items-center">
					<span class="text-large font-600 mr-3" style="font-size: 1.5rem;"> {{ props.cont_meta.name }} </span>
					<el-tag v-show="props.cont_tag">{{ props.cont_tag }}</el-tag>
				</div>
				<div style="font-size:0.9rem">
					<span>
						创建时间：<span style="color:#119191">{{ TransTime(props.cont_meta.cTime) }}</span>
					</span>
					<span>&emsp;&emsp;</span>
					<span>
						修改时间：<span style="color:#119191">{{ TransTime(props.cont_meta.mTime) }}</span>
					</span>
				</div>
			</template>
			<template #extra>
				<el-tooltip placement="left">
					<template #content>
						<span>页面加载时间：{{ TransTime(props.cont_refresh[0]) }}</span>
						<span v-show="props.cont_refresh.length > 1"><br>XRateLimit重置时间：{{ TransTime(props.cont_refresh[1])
						}}</span>
						<span v-show="props.cont_refresh.length > 1"><br>XRateLimit剩余请求次数：{{ props.cont_refresh[2] }}</span>
					</template>
					<el-button :icon="RefreshRight" type="primary" :plain="true"
						@click="props.click_refresh ? props.click_refresh() : null"></el-button>
				</el-tooltip>
			</template>
			<div></div>
		</el-page-header>

		<div v-loading="props.isLoading" :class="props.type" element-loading-text="加载中...">
			<div style="word-break:break-all;overflow:hidden;">
				<div v-html="props.cont_article"> </div>
			</div>

			<div v-show="props.showAddition">
				<el-divider content-position="left">附加信息</el-divider>
				<el-col :span="8" v-show="props.cont_meta.struct">
					<TreeView :data="props.cont_meta.struct" @click="ItemClick" type="" :searchable="false" />
				</el-col>

				<p v-show="props.cont_meta.language != null">主要语言：{{ props.cont_meta.language }}</p>
				<p v-show="props.cont_meta.stars != null">关注数：{{ props.cont_meta.stars }}</p>
				<p v-show="props.cont_meta.isforked != null">是否fork：{{ props.cont_meta.isforked }}</p>
				<p v-show="props.cont_meta.allowforking != null">允许fork：{{ props.cont_meta.allowforking }}</p>
				<p v-show="props.cont_meta.forks != null">fork数：{{ props.cont_meta.forks }}</p>
				<p v-show="props.cont_meta.url != null">
				<p>点击跳转<a :href="props.cont_meta.url" target="_blank">Github链接</a></p>
				</p>

			</div>
		</div>
	</div>
</template>

