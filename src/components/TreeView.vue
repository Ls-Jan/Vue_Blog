<script setup>

import { ref, watch, onMounted, reactive } from 'vue'
import { ElTree, ElInput } from 'element-plus';
import { Search } from '@element-plus/icons-vue'
import { ElScrollbar } from 'element-plus'

const props = defineProps({
    data: { default: [{ label: 'None', children: [] }] },
    isLoading: { default: false },
    type: { default: 'TreeView_Large' },
    emptyText: { default: '无数据' },
    searchable: { default: true }
});
const emit = defineEmits(['click']);//click(path,node)，path是路径列表，node是ElTree树节点




//获取组件实例以调用组件方法：https://blog.csdn.net/weixin_46069164/article/details/123980310
const treeRef = ref()
const filterText = ref('')
watch(filterText, () => {
    treeRef.value.filter(filterText.value);
})

function ClickNode(data, node) {
    let lst = [];
    let curr = node;
    do {
        lst.push(curr.label)
        curr = curr.parent;
    }
    while (curr.level > 0);
    emit('click', lst.reverse(), node);
}

function FilterNode(value, data) {
    if (!value) return true
    return data.label.toLowerCase().includes(value.toLowerCase())
}

</script>

<template>
    <div v-loading="props.isLoading" style="user-select: none;" :class="props.type" element-loading-text="加载中...">

        <el-input :prefix-icon="Search" v-if="props.searchable" v-model="filterText" placeholder="搜索" />
        <el-scrollbar>
            <el-tree ref="treeRef" :filter-node-method="FilterNode" :data="props.data" :empty-text="props.emptyText"
                @node-click="ClickNode" accordion />
        </el-scrollbar>
    </div>
</template>


<!-- 通过这个方法设置的树样式，会影响到全局的树 -->
<!-- 但通过设置组件的class可以有效规避这个问题 -->
<style>
.TreeView_Large {
    .el-tree-node__content {
        height: fit-content;
    }

    .el-tree-node__label {
        font-size: 1.2rem;
        line-height: 3rem;
        letter-spacing: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.el-tree__empty-block {
    height: 10rem;
}

.el-tree__empty-text {
    overflow: hidden;
    width: 100%;
    white-space: pre-wrap;
    word-break: break-all;
}
</style>

