<script setup>
//   import { reactive, ref, onMounted, getCurrentInstance,computed } from 'vue@3.2.47';
// import { Container, Draggable } from 'vue3-smooth-dnd@0.0.5'
// import {
//     ElButton,
//     ElInput,
//     ElIcon,
//     ElTooltip,
//     ElText,
//     ElDialog,
//     ElForm,
//     ElFormItem,
//     ElSelect,
//     ElOption,
//     ElDatePicker
// } from 'element-plus@2.3.3'
// import { HelpFilled, Refresh, Delete } from '@element-plus/icons-vue@2.1.0'
// import 'element-plus@2.3.3/dist/index.css'
import { reactive, ref, onMounted, getCurrentInstance, computed } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd'
import {
    ElButton,
    ElInput,
    ElIcon,
    ElTooltip,
    ElText,
    ElDialog,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElDatePicker,
    ElCheckbox
} from 'element-plus'
import { HelpFilled, Refresh, Delete,Clock } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
const { ctx } = getCurrentInstance()
let currentObj = reactive({})
const dialogTitle = ref('')
const dialogFormVisible = ref(false)
const wide = ref(false)
const formLabelWidth = '70px'
const checkedType = ref(false)

const repeatData = [
    {
        label: '无',
        value: 'no',
    },
    {
        label: '每天',
        value: 'day',
    },
    {
        label: '每周',
        value: 'week',
    },
    {
        label: '每月',
        value: 'month',
    }
]
const priorityData = [
    {
        label: '高优先级',
        value: 'high',
    },
    {
        label: '中优先级',
        value: 'medium',
    },
    {
        label: '低优先级',
        value: 'low',
    },
    {
        label: '无优先级',
        value: 'nomal',
    }
]
let form = ref({
    date: '',
    priority: 'nomal',
    repeat: 'no',
})
const priorityColor = {
    high: '#f96057',
    medium: '#f8ce52',
    low: '#5fcf65',
    nomal: '#9da1aa',
}
const newTodo = ref('')

const todoLists = [
    {
        type: 'todo',
        name: 'Todo',
        props: {
            orientation: 'vertical',
        },
        children: [
            {
                id: `00005`,
                type: 'todo',
                content: '周报填写',
                date: '2023/05/06 18:00:00',
                dateName: '今天',
                priority: 'medium',
                repeat: 'no',
                checkedType:false
            },
            {
                id: `00001`,
                type: 'todo',
                content: '下班后去超市买零食',
                date: '2023/05/05 18:00:00',
                dateName: '今天',
                priority: 'low',
                repeat: 'no',
                checkedType:false
            },
        ],
    },
    {
        type: 'doing',
        name: 'Doing',
        props: {
            orientation: 'vertical',
        },
        children: [
            {
                type: 'doing',
                id: `00002`,
                content: '表单校验bug修复',
                date: '2023/04/28 10:00:00',
                dateName: '今天',
                priority: 'high',
                repeat: 'no',
                checkedType:false
            },
        ],
    },
    {
        type: 'done',
        name: 'Done',
        props: {
            orientation: 'vertical',
        },
        children: [
            {
                type: 'done',
                id: `00003`,
                content: '准备晨会内容',
                date: '2023/04/12 08:00:00',
                dateName: '今天',
                priority: 'nomal',
                repeat: 'day',
                checkedType:true
            },
        ],
    },
]
const valueTep={
    todo:false,
    doing:false,
    done:true,
}
// mock
let scene = reactive({
    type: 'container',
    props: {
        orientation: 'horizontal',
    },
    children: todoLists,
})

const num = computed(() => scene.children.filter(t => t.type === 'todo')[0].children.length)

onMounted(() => {
    getTodayDate();
    getTodo()
})

function addTodo() {
    const obj = {
        type: 'todo',
        id: generateId(),
        content: newTodo.value,
        date: getTodayDate(),
        dateName: '今天',
        priority: 'nomal',
        repeat: 'no',
        checkedType:false
    }
    // const newScene = Object.assign({}, scene)
    const newScene = reactive(scene)
    const data = newScene.children
    const todoIndex = data.findIndex((column) => column.type === 'todo')
    const todoColumn = data[todoIndex] // 获取该列的对象
    const newTodoChildren = [obj, ...todoColumn.children]

    const newData = [
        ...data.slice(0, todoIndex),
        { ...todoColumn, children: newTodoChildren },
        ...data.slice(todoIndex + 1),
    ]
    newScene.children = newData
    newTodo.value = ''
    saveData(newScene)
    change()
    console.log('sss===sss', scene, newScene)
}
function change() {
    ctx.$forceUpdate()
}

function openDialog(obj) {
    if (obj.type === 'done') return;
    currentObj = obj;
    dialogTitle.value = obj.content;
    const { date, priority, repeat } = obj;
    form.value = { date, priority, repeat };
    dialogFormVisible.value = true;
}
function resetDialog() {
    dialogTitle.value = '';
    dialogFormVisible.value = false
    console.log('===close dialog')
}

function submitDialog() {
    console.log('===submit dialog')
    const newScene = reactive(scene)
    const data = newScene.children;
    const { date, priority, repeat } = form.value;
    const listIndex = data.findIndex(list => list.type === currentObj.type);
    const listItemIndex = data[listIndex].children.findIndex(child => child.id === currentObj.id);
    if (listItemIndex !== -1) {
        data[listIndex].children[listItemIndex] = {
            ...data[listIndex].children[listItemIndex],
            date: date,
            priority,
            repeat,
        };
    }
    newScene.children = data;
    saveData(newScene)
    resetDialog();
}
function submitDel(obj) {
    const newScene = reactive(scene)
    const data = newScene.children;
    const updatedData = data.map((item) => {
        if (item.children) {
            const updatedChildren = item.children.filter((child) => child.id !== obj.id);
            return { ...item, children: updatedChildren };
        }
        return item;
    });
    newScene.children = updatedData;
    saveData(newScene)
    change()
    resetDialog();
}
function changeType(obj){
    const {type,targetId}=obj;
    const typeTep={
        todo:'done',
        doing:'done',
        done:'todo',
    }
    const newType=typeTep[type];
    let newItem = Object.assign({}, obj);
    newItem={
        ...newItem,
        type:typeTep[type],
        checkedType:valueTep[newType]
    }
     if (newType === 'done') {
        // 从done拖动到其他等级变为nomal
        newItem.priority = 'nomal';
    }
    if (type === 'done') {
        // 从done拖动到其他地方，日期改为今天
        newItem.date = getTodayDate();
    }

    const newScene = reactive(scene)
    const data=newScene.children;
    const delIndex = data.findIndex(item => item.type === type);
    const addIndex = data.findIndex(item => item.type === newType);
    // 将该任务从数组中删除
    const index = data[delIndex].children.indexOf(obj);
    if (index !== -1) {
        data[delIndex].children.splice(index, 1);
    }
    // 将该任务添加到的数组中
    data[addIndex].children.push(newItem);

    newScene.children = data;
    saveData(newScene)
    console.log('scene===',scene);
}

function deepSceneChild() {
    const newScene = reactive(scene)
    return newScene.children;
}
function updateHandle(){
    const todoItem = todoLists[0].children.find(item => item.id === '00005');
    const doingIndex = todoLists.findIndex(item => item.type === 'doing');
    todoLists[doingIndex].children.splice(1, 0, todoItem);
}
function generateId() {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < 5; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return id
}

function onCardDrop(columnType, dropResult) {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const newScene = reactive(scene)
        const column = newScene.children.filter((p) => p.type === columnType)[0]
        const itemIndex = newScene.children.indexOf(column)
        const newColumn = Object.assign({}, column)
        const { type } = dropResult.payload;
        // 判断是否是移动的target
        if (dropResult.removedIndex == null && dropResult.addedIndex >= 0) {
            if (columnType === 'done') {
                // 从done拖动到其他等级变为nomal
                dropResult.payload.priority = 'nomal';
            }
            if (type === 'done') {
                // 从done拖动到其他地方，日期改为今天
                dropResult.payload.date = getTodayDate();
            }
          
            dropResult.payload.type = columnType;
            dropResult.payload.checkedType = valueTep[columnType];
        }
        newColumn.children = applyDrag(newColumn.children, dropResult)
        newScene.children.splice(itemIndex, 1, newColumn)
        saveData(newScene)
    }
}
function onColumnDrop(dropResult) {
    const newScene = reactive(scene)
    newScene.children = applyDrag(newScene.children, dropResult)
    saveData(newScene);
}
function applyDrag(arr, dragResult) {
    const { removedIndex, addedIndex, payload } = dragResult
    if (removedIndex === null && addedIndex === null) return arr
    const result = [...arr]
    let itemToAdd = payload
    if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0]
    }
    if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd)
    }
    return result
}
function getCardPayload(columnType) {
    return (index) => {
        return scene.children.filter((p) => p.type === columnType)[0]
            .children[index]
    }
}
function saveData(newScene) {
    scene = newScene;
    // 存储更新后的数据到 localStorage
    console.log('setItem => loading', scene.children)
    localStorage.setItem('items', JSON.stringify(scene.children))
}

function getTodo() {
    // 读取 localStorage 中的数据
    const storedItems = JSON.parse(localStorage.getItem('items'))
    console.log('storedItems,', storedItems)
    if (storedItems) {
        scene.children = storedItems
    }
}

function toggleDarkOrLight() {
    document.body.classList.toggle('light-mode');
}
function getTodayDate() {
    // 获取当前日期时间
    const now = new Date();

    // 解构赋值获取年、月、日、小时、分钟、秒
    const { year, month, day, hours, minutes, seconds } = {
        year: now.getFullYear(),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        day: String(now.getDate()).padStart(2, '0'),
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0'),
        seconds: String(now.getSeconds()).padStart(2, '0')
    };

    // 使用模板字符串将日期时间格式化成指定格式
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;


}

</script>
<template>
    <div class="video-bg">
        <div class="cv-header">

            <!--Content before waves-->
            <div class="inner-header">
            </div>

            <!--Waves Container-->
            <div>
                <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
                    <defs>
                        <path id="gentle-wave"
                            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g class="parallax">
                        <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(77,170,233,0.7" />
                        <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(220,120,255,0.5)" />
                        <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(54,53,115,0.3)" />
                        <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba(234,45,54,0.6)" />
                    </g>
                </svg>
            </div>
            <!--Waves end-->

        </div>
    </div>
    <div class="dark-light" @click="toggleDarkOrLight">
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    </div>
    <div class="app page">
        <div class="header" :class="{ 'wide': wide }">
            <div class="menu-circle">
            </div>
            <div class="search-bar">
                <el-input v-model="newTodo" placeholder="例如：每天11:30定外卖" clearable class="mr20" autocomplete="off"
                    name="news" maxlength="15" show-word-limit @focus="wide = true" @blur="wide = false" @input="change()"
                    @keyup.enter.native="addTodo" />
                 <!-- <el-button type="primary" class="mlt3"  @input="change()">添加</el-button> -->
            </div>
            <div class="header-profile">
                <div class="notification">
                    <span class="notification-number">{{ num }}</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                </div>
            </div>
        </div>
        <div class="wrapper">
            <div class="main-container">
                <div class="content-wrapper">
                    <div class="content-section">
                        <div class="apps-card ">
                            <Container class="page-card h-full flex  gap-8 flex-row" group-name="cols" tag="div"
                                orientation="horizontal" @drop="onColumnDrop($event)">
                                <Draggable
                                    class="page-card-item app-card dragg-wrapper-bg dark:bg-gray-700 rounded-lg h-full  flex-shrink-0 shadow-xl"
                                    v-for="(column, index) in scene.children" :key="index">
                                    <div class=" h-full flex flex-col">
                                        <!-- header -->
                                        <div class="drag-header cursor-move rounded-t-lg p-4 space-x-4 flex space-x-2">
                                            <!-- class="cursor-move rounded-t-lg p-4 space-x-4 bg-primary text-white flex space-x-2"> -->
                                            <!-- <span class="text-lg font-header-30">{{ column.name }}</span> -->
                                            <span>
                                                {{ column.name }}
                                            </span>
                                        </div>
                                        <!-- column  -->
                                        <Container class="page-column flex-grow overflow-y-auto overflow-x-hidden"
                                            group-name="col-items"
                                            :shouldAcceptDrop="(e, payload) => e.groupName === 'col-items'"
                                            :get-child-payload="getCardPayload(column.type)"
                                            :drop-placeholder="{ className: `bg-primary bg-opacity-20  border-dotted border-2  border-primary rounded-lg mx-4 my-2`, animationDuration: '200', showOnTop: true, }"
                                            drag-class="bg-primary dark:bg-primary 
                                            border-2 border-primary-hover text-white 
                                            transition duration-100 ease-in z-50
                                            transform rotate-6 scale-110" drop-class="transition duration-100 
                                            ease-in z-50 transform 
                                            -rotate-2 scale-90" @drop="(e) => onCardDrop(column.type, e)">
                                            <!-- Items  -->
                                            <template v-for="item in column.children">
                                                <Draggable :key="item.id" :item="item" v-if="item" class="drag-item">
                                                    <ul @click="openDialog(item)" class="cursor-move borderL "
                                                        :style="{ 'borderLeftColor': `${priorityColor[item.priority]} !important` }">
                                                        <li class="list adobe-product flex-col">
                                                            <div class="list-name flex-row space-between ">
                                                                <div> {{ item.content }}</div>
                                                                <div  >
                                                                    <el-checkbox v-model="item.checkedType" @change="changeType(item)" @click.stop.native="()=>{}"/>
                                                                </div>
                                                            </div>
                                                            <div class="list-date flex-row space-between">
                                                                <div class="opcity">
                                                                    <el-icon><Clock /></el-icon> 
                                                                    {{ item.date.replace('2023/', '') }}
                                                                </div>
                                                                <div class="list-right-icon">
                                                                    <el-icon v-show="item.repeat !== 'no'" size="14"
                                                                        class="mr5" color="#396df0">
                                                                        <Refresh />
                                                                    </el-icon>
                                                                    <el-icon size="14" color="#DB3B26"
                                                                        @click.stop="submitDel(item)">
                                                                        <Delete />
                                                                    </el-icon>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </Draggable>
                                            </template>
                                        </Container>
                                    </div>
                                </Draggable>
                            </Container>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="overlay-app"></div>
        <div class="pop-up pop-form" v-if="dialogFormVisible">
            <div class="pop-up__title">
                {{ dialogTitle }}
            </div>
            <el-form class="mtb30" :model="form">
                <el-form-item label="日期时间" :label-width="formLabelWidth">
                    <el-date-picker v-model="form.date" type="datetime" placeholder="选择日期" format="YYYY/MM/DD HH:mm:ss"
                        value-format="YYYY/MM/DD HH:mm:ss" />
                </el-form-item>
                <el-form-item label="优先级" :label-width="formLabelWidth">
                    <el-select v-model="form.priority">
                        <el-option v-for="(option, index) in priorityData" :key="option.value + index" :label="option.label"
                            :value="option.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="重复" :label-width="formLabelWidth">
                    <el-select v-model="form.repeat">
                        <el-option v-for="(option, index) in repeatData" :key="option.value + index" :label="option.label"
                            :value="option.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="content-button-wrapper">
                <button class="content-button status-button open close" @click="resetDialog">取消</button>
                <button class="content-button status-button" @click="submitDialog">确认</button>
        </div>
    </div>
</div>
</template>
<style lang="scss">
@import './JuejinPage.scss';
</style>
