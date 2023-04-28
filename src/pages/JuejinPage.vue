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
import { HelpFilled, Refresh, Delete, Clock } from '@element-plus/icons-vue'
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
    low: '#3bf083',
    nomal: '#746dee',
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
                repeat: 'day',
                checkedType: false
            },
            {
                id: `00001`,
                type: 'todo',
                content: '下班后去超市买零食',
                date: '2023/05/05 18:00:00',
                dateName: '今天',
                priority: 'low',
                repeat: 'no',
                checkedType: false
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
                checkedType: false
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
                checkedType: false
            },
        ],
    },
]
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
    if(newTodo.value.trim() === '') return;
    const obj = {
        type: 'todo',
        id: generateId(),
        content: newTodo.value,
        date: getTodayDate(),
        dateName: '今天',
        priority: 'nomal',
        repeat: 'no',
        checkedType: false
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
function changeType(obj) {
    const { type, targetId } = obj;
    const typeTep = {
        todo: 'doing',
        doing: 'done',
        done: 'todo',
    }
    const newType = typeTep[type];
    let newItem = Object.assign({}, obj);
    newItem = {
        ...newItem,
        type: typeTep[type],
        checkedType: false
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
    const data = newScene.children;
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
    console.log('scene===', scene);
}

function deepSceneChild() {
    const newScene = reactive(scene)
    return newScene.children;
}
function updateHandle() {
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
                                                                <div>
                                                                    <el-checkbox v-model="item.checkedType"
                                                                        @change="changeType(item)"
                                                                        @click.stop.native="() => { }" />
                                                                </div>
                                                            </div>
                                                            <div class="list-date flex-row space-between">
                                                                <div class="opcity">
                                                                    <svg t="1682682900155" class="icon"
                                                                        viewBox="0 0 1024 1024" version="1.1"
                                                                        xmlns="http://www.w3.org/2000/svg" p-id="4312"
                                                                        width="24" height="24" fill="currentColor">
                                                                        <path
                                                                            d="M762.4 128.2c-2.6-0.2-5.2-0.2-7.8-0.2h-0.4c-32.4 0-64 10.8-89.2 30.2-3.2 2.6-5.2 6.4-5.4 10.4-0.2 4 1.6 8 4.6 10.8l179.6 161c2.6 2.2 5.8 3.6 9.2 3.6h0.8c3.8-0.2 7.2-2 9.6-4.8C881.8 318 896 301.6 896 266c0.2-72.8-58.2-133.6-133.6-137.8zM128 266c0 35.6 14.2 52 32.6 73.2 2.4 2.8 5.8 4.6 9.6 4.8h0.8c3.4 0 6.6-1.2 9.2-3.6L360 179.4c3-2.8 4.8-6.6 4.6-10.8-0.2-4-2-7.8-5.4-10.4C334 138.8 302.4 128 270 128h-0.4c-2.6 0-5.2 0-7.8 0.2-75.4 4.2-134 65-133.8 137.8z"
                                                                            p-id="4313"></path>
                                                                        <path
                                                                            d="M780 772c52.4-61.4 84-141 84-228 0-194.4-157.6-352-352-352S160 349.6 160 544c0 87 31.6 166.6 84 228l-69.4 71c-12.4 12.6-12 31 0.6 43.2 6.2 6 14.8 9.6 22.8 9.6 8.4 0 16.2-3.8 22.4-10.2l69.2-69c60.6 49.4 138 79.2 222.4 79.2s161.8-29.6 222.4-79.2l67.2 69c6.2 6.4 14.6 10.2 23 10.2 8 0 16.2-3.6 22.4-9.6 12.6-12.4 15-30.6 2.6-43.2L780 772zM540 548c0 15.4-12.6 28-28 28h-164c-15.4 0-28-12.6-28-28s12.6-28 28-28h136V316c0-15.4 12.6-28 28-28s28 12.6 28 28v232z"
                                                                            p-id="4314"></path>
                                                                    </svg>
                                                                    {{ item.date.replace('2023/', '') }}
                                                                </div>
                                                                <div class="list-right-icon flex">
                                                                    <div v-show="item.repeat !== 'no'">
                                                                        <svg t="1682682580782" class="icon-repeat"
                                                                            viewBox="0 0 1024 1024" version="1.1"
                                                                            xmlns="http://www.w3.org/2000/svg" p-id="4156"
                                                                            width="24" height="24" fill="currentColor">
                                                                            <path
                                                                                d="M984 514.2c-5.2-5.2-12-8-19.2-8-7.2 0-14 2.8-19.2 8l-26 26c8.6-123.6-39-245-130.6-330C713.8 140.4 615.4 102 512.2 102c-53.4 0-105.6 10.2-154.8 30.2-51 20.8-96.6 51.2-135.4 90.6-26.4 26.8-49.2 57-67.2 89.6-3.8 6.8-4.6 14.8-2.4 22.2 2.2 7.4 7.6 13.6 14.4 17 4 2 8.4 3 12.8 3 10.4 0 19.8-5.6 24.8-14.6 15.8-28.6 35.6-55 58.8-78.2 33.6-33.6 72.6-59.6 116.2-77.4 42.2-17.2 86.8-25.8 132.4-25.8 45.8 0 90.4 8.6 132.6 25.8 43.6 17.8 82.8 43.8 116.4 77.6 40.6 40.8 70.8 91.2 87.6 146 14 45.8 18.4 94.6 13.2 142.4l-37.8-37c-5-4.8-11.6-7.6-18.6-7.6-7 0-13.8 2.8-18.8 7.8-10.4 10.4-10.4 27.2 0 37.6l85.6 85.8c3.8 3.8 8.8 5.8 14 5.8 5.2 0 10.2-2 14-5.8l84.2-84.4c10.4-10.6 10.4-27.8-0.2-38.4z m-126.8 157.6c-4-2-8.4-3-12.8-3-10.4 0-19.8 5.6-24.8 14.6-15.8 28.6-35.6 55-58.8 78.2-33.6 33.6-72.6 59.8-116.4 77.4-42.2 17.2-86.8 25.8-132.6 25.8s-90.4-8.6-132.4-25.8c-43.6-17.8-82.8-43.8-116.4-77.4-75.2-75.6-112-181.8-100.6-287.8l36.8 37c4.8 4.8 11.2 7.4 18 7.4 6.8 0 13.2-2.6 18-7.4l2.6-2.6c9.8-9.8 9.8-26 0-35.8l-85.8-86c-3.8-3.8-8.8-5.8-14-5.8-5.2 0-10.2 2-14 5.8l-84 84.6c-10.6 10.6-10.6 27.8 0 38.4 5.2 5.2 12 8 19.2 8 7.2 0 14-2.8 19.2-8l26-26.2c-3.6 51.6 2.6 104 18 153 19.8 62.8 53.6 118.6 100.6 165.6 39 39.2 84.4 69.4 135.2 90.2 49 20 100.8 30 153.8 30 53 0 104.8-10.2 153.8-30 50.8-20.6 96.2-51 135.2-90.2 27-27 50-57.6 68.4-90.8 3.8-6.8 4.6-14.8 2.4-22.2-2.4-7.4-7.6-13.6-14.6-17z"
                                                                                p-id="4157"></path>
                                                                        </svg>
                                                                    </div>
                                                                    <!-- <el-icon v-show="item.repeat !== 'no'" size="14"
                                                                        class="mr5" color="#396df0">
                                                                        <Refresh />
                                                                    </el-icon> -->
                                                                    <div class="svg-icon" @click.stop="submitDel(item)">
                                                                        <svg t="1682682505644" class="icon-del"
                                                                            viewBox="0 0 1024 1024" version="1.1"
                                                                            xmlns="http://www.w3.org/2000/svg" p-id="20660"
                                                                            width="24" height="24" fill="currentColor">
                                                                            <path
                                                                                d="M725.333333 256h213.333334v85.333333h-85.333334v554.666667a42.666667 42.666667 0 0 1-42.666666 42.666667H213.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V341.333333H85.333333V256h213.333334V128a42.666667 42.666667 0 0 1 42.666666-42.666667h341.333334a42.666667 42.666667 0 0 1 42.666666 42.666667v128z m42.666667 85.333333H256v512h512V341.333333zM384 170.666667v85.333333h256V170.666667H384z"
                                                                                p-id="20661"></path>
                                                                        </svg>
                                                                    </div>
                                                                    <!-- <el-icon size="14" color="#DB3B26"
                                                                        @click.stop="submitDel(item)">
                                                                        <Delete />
                                                                    </el-icon> -->
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
</div></template>
<style lang="scss">@import './JuejinPage.scss';</style>
