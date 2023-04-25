<script setup>
import { reactive, ref, onMounted, getCurrentInstance } from 'vue';
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
    ElDatePicker
} from 'element-plus'
import { HelpFilled, Refresh, Delete } from '@element-plus/icons-vue'
const { ctx } = getCurrentInstance()
const currentDate = ref('2023-4-25');
let currentObj = reactive({})
const dialogTitle = ref('')
const dialogFormVisible = ref(false)
const wide = ref(false)
const formLabelWidth = '60px'
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
    high: '#DB3B26',
    medium: '#FFB95B',
    low: '#396df0',
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
                id: `00001`,
                type: 'todo',
                content: '下班后去超市买零食',
                date: 'today',
                dateName: '今天',
                priority: 'low',
                repeat: 'no'
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
                date: 'today',
                dateName: '今天',
                priority: 'high',
                repeat: 'no'
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
                date: 'today',
                dateName: '今天',
                priority: 'medium',
                repeat: 'day',
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

onMounted(() => {
    init()
    getTodo()
})

function addTodo() {
    const obj = {
        type: 'todo',
        id: generateId(),
        content: newTodo.value,
        date: currentDate,
        dateName: '今天',
        priority: 'nomal',
        repeat: 'no'
    }
    const newScene = Object.assign({}, scene)
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
    const newScene = Object.assign({}, scene)
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
    const newScene = Object.assign({}, scene)
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
    resetDialog();
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
        const newScene = Object.assign({}, scene)
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
                dropResult.payload.date = currentDate;
            }
            dropResult.payload.type = columnType;
        }
        newColumn.children = applyDrag(newColumn.children, dropResult)
        newScene.children.splice(itemIndex, 1, newColumn)
        saveData(newScene)
    }
}
function onColumnDrop(dropResult) {
    const newScene = Object.assign({}, scene)
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

function init() {

    // $(function () {
    //     $(".menu-link").click(function () {
    //         $(".menu-link").removeClass("is-active");
    //         $(this).addClass("is-active");
    //     });
    // });

    // $(function () {
    //     $(".main-header-link").click(function () {
    //         $(".main-header-link").removeClass("is-active");
    //         $(this).addClass("is-active");
    //     });
    // });

    // const dropdowns = document.querySelectorAll(".dropdown");
    // dropdowns.forEach((dropdown) => {
    //     dropdown.addEventListener("click", (e) => {
    //         e.stopPropagation();
    //         dropdowns.forEach((c) => c.classList.remove("is-active"));
    //         dropdown.classList.add("is-active");
    //     });
    // });

    // $(".search-bar input")
    //     .focus(function () {
    //         $(".header").addClass("wide");
    //     })
    //     .blur(function () {
    //         $(".header").removeClass("wide");
    //     });

    // $(document).click(function (e) {
    //     var container = $(".status-button");
    //     var dd = $(".dropdown");
    //     if (!container.is(e.target) && container.has(e.target).length === 0) {
    //         dd.removeClass("is-active");
    //     }
    // });

    // $(function () {
    //     $(".dropdown").on("click", function (e) {
    //         $(".content-wrapper").addClass("overlay");
    //         e.stopPropagation();
    //     });
    //     $(document).on("click", function (e) {
    //         if ($(e.target).is(".dropdown") === false) {
    //             $(".content-wrapper").removeClass("overlay");
    //         }
    //     });
    // });

    // $(function () {
    //     $(".status-button:not(.open)").on("click", function (e) {
    //         console.log('--', $(".overlay-app"))
    //         $(".overlay-app").addClass("is-active");
    //     });
    //     $(".pop-up .close").click(function () {
    //         $(".overlay-app").removeClass("is-active");
    //     });
    // });

    // $(".status-button:not(.open)").click(function () {
    //     $(".pop-up").addClass("visible");
    // });

    // $(".pop-up .close").click(function () {
    //     $(".pop-up").removeClass("visible");
    // });

}

function toggleDarkOrLight() {
    document.body.classList.toggle('light-mode');
}

</script>
<template>
    <div class="video-bg">
        <video width="320" height="240" autoplay loop muted>
            <source src="https://assets.codepen.io/3364143/7btrrd.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>
    <div class="dark-light" @click="toggleDarkOrLight">
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    </div>
    <div class="app page">
        <div class="header" :class="{ 'wide': wide }">
            <!-- <div class="menu-circle"></div>
            <div class="header-menu">
                <a class="menu-link is-active" href="#">Apps</a>
                <a class="menu-link notify" href="#">Your work</a>
                <a class="menu-link" href="#">Discover</a>
                <a class="menu-link notify" href="#">Market</a>
            </div> -->
            <div class="search-bar">
                <!-- <input type="text" v-model="newTodo" placeholder="Search"> -->
                <el-input v-model="newTodo" placeholder="例如：每天11:30定外卖" clearable class="mr20" autocomplete="off"
                    name="news" maxlength="18" show-word-limit @focus="wide = true" @blur="wide = false" @input="change()"
                    @keyup.enter.native="addTodo" />
            </div>
            <div class="header-profile">
                <div class="notification">
                    <span class="notification-number">3</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                </div>
                <!-- <svg viewBox="0 0 512 512" fill="currentColor">
                    <path
                        d="M448.773 235.551A135.893 135.893 0 00451 211c0-74.443-60.557-135-135-135-47.52 0-91.567 25.313-115.766 65.537-32.666-10.59-66.182-6.049-93.794 12.979-27.612 19.013-44.092 49.116-45.425 82.031C24.716 253.788 0 290.497 0 331c0 7.031 1.703 13.887 3.006 20.537l.015.015C12.719 400.492 56.034 436 106 436h300c57.891 0 106-47.109 106-105 0-40.942-25.053-77.798-63.227-95.449z" />
                </svg>
                <img class="profile-img"
                    src="https://images.unsplash.com/photo-1600353068440-6361ef3a86e8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                    alt=""> -->
            </div>
        </div>
        <div class="wrapper">
            <div class="main-container">
                <div class="content-wrapper">
                    <div class="content-section">
                        <!-- <div class="content-section-title">Apps in your plan</div> w-96 p-8 overflow-x-auto-->
                        <div class="apps-card flex-row">
                            <Container class="h-full flex  gap-8 " group-name="cols" tag="div"
                                orientation="horizontal" @drop="onColumnDrop($event)">
                                <Draggable
                                    class="app-card dragg-wrapper-bg dark:bg-gray-700 rounded-lg h-full  flex-shrink-0 shadow-xl"
                                    v-for="(column, index) in scene.children" :key="index">
                                    <div class=" h-full flex flex-col">
                                        <!-- header -->
                                        <div class="cursor-move rounded-t-lg p-4 space-x-4 flex space-x-2">
                                            <!-- class="cursor-move rounded-t-lg p-4 space-x-4 bg-primary text-white flex space-x-2"> -->
                                            <!-- <span class="text-lg font-header-30">{{ column.name }}</span> -->
                                            <span>
                                                <svg viewBox="0 0 512 512" style="border: 1px solid #a059a9">
                                                    <path xmlns="http://www.w3.org/2000/svg"
                                                        d="M480 0H32C14.368 0 0 14.368 0 32v448c0 17.664 14.368 32 32 32h448c17.664 0 32-14.336 32-32V32c0-17.632-14.336-32-32-32z"
                                                        fill="#210027" data-original="#7b1fa2" />
                                                    <g xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M192 64h-80c-8.832 0-16 7.168-16 16v352c0 8.832 7.168 16 16 16s16-7.168 16-16V256h64c52.928 0 96-43.072 96-96s-43.072-96-96-96zm0 160h-64V96h64c35.296 0 64 28.704 64 64s-28.704 64-64 64zM400 256h-32c-18.08 0-34.592 6.24-48 16.384V272c0-8.864-7.168-16-16-16s-16 7.136-16 16v160c0 8.832 7.168 16 16 16s16-7.168 16-16v-96c0-26.464 21.536-48 48-48h32c8.832 0 16-7.168 16-16s-7.168-16-16-16z"
                                                            fill="#f6e7fa" data-original="#e1bee7" />
                                                    </g>
                                                </svg>
                                                {{ column.name }}
                                            </span>
                                        </div>
                                        <!-- column  -->
                                        <Container class="page-column flex-grow overflow-y-auto overflow-x-hidden"
                                            group-name="col-items" :shouldAcceptDrop="(e, payload) => e.groupName === 'col-items'
                                                " :get-child-payload="getCardPayload(column.type)" :drop-placeholder="{
            className: `bg-primary bg-opacity-20  
                                            border-dotted border-2 
                                            border-primary rounded-lg mx-4 my-2`,
            animationDuration: '200',
            showOnTop: true,
        }" drag-class="bg-primary dark:bg-primary 
                                            border-2 border-primary-hover text-white 
                                            transition duration-100 ease-in z-50
                                            transform rotate-6 scale-110" drop-class="transition duration-100 
                                            ease-in z-50 transform 
                                            -rotate-2 scale-90" @drop="(e) => onCardDrop(column.type, e)">
                                            <!-- Items  -->
                                            <template v-for="item in column.children">
                                                <Draggable :key="item.id" :item="item" v-if="item">
                                                   <ul @click="openDialog(item)" class="cursor-move">
                                                    <li class="list adobe-product">
                                                    <div class="products">
                                                        <el-icon class="el-input_icon" size="20px"
                                                            :color="priorityColor[item.priority]">
                                                            <HelpFilled />
                                                        </el-icon>
                                                       {{ item.content }}
                                                    </div>
                                                    <div class="button-wrapper list-right  cursor">
                                                        <div class="list-right cursor">
                                                            <div class="list-right-date">{{ item.dateName }}</div>
                                                            <div class="list-right-icon" v-show="item.repeat !== 'no'">
                                                                <el-icon size="14" class="mr5" color="#396df0">
                                                                    <Refresh />
                                                                </el-icon>
                                                                <el-icon  size="14" color="#DB3B26"
                                                                    @click.stop="submitDel(item)">
                                                                    <Delete />
                                                                </el-icon>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </li>
                                                   </ul>



                                                    <!-- <div @click="openDialog(item)"
                                                        class="cursor-move my-2 mx-4 rounded-lg shadow-md dark:bg-gray-800 hover:border-2 border-primary">
                                                        <div class="list adobe-product space-y-2 flex-row space-between">
                                                            <div
                                                                class="list-left products rounded-lg p-2 w-max inline-block box-content flex-row">
                                                                <el-icon class="el-input_icon" size="20px"
                                                                    :color="priorityColor[item.priority]">
                                                                    <HelpFilled />
                                                                </el-icon>
                                                                <span class="list-left-name">{{ item.content }}</span>
                                                            </div>
                                                            <div class="button-wrapper list-right cursor">
                                                                <div class="list-right-date">{{ item.dateName }}</div>
                                                                <div class="list-right-icon" v-show="item.repeat !== 'no'">
                                                                    <el-icon size="14" color="#475669">
                                                                        <Refresh />
                                                                    </el-icon>
                                                                    <el-icon class="ml5" size="14" color="#DB3B26"
                                                                        @click.stop="submitDel(item)">
                                                                        <Delete />
                                                                    </el-icon>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div> -->
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
                <el-form-item label="日期" :label-width="formLabelWidth">
                    <el-date-picker v-model="form.date" type="date" placeholder="选择日期" format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD" />
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
            <!-- <div class="pop-up__subtitle">Adjust your selections for advanced options as desired before continuing. <a
                    href="#">Learn more</a></div>
            <div class="checkbox-wrapper">
                <input type="checkbox" id="check1" class="checkbox">
                <label for="check1">Import previous settings and preferences</label>
            </div>
            <div class="checkbox-wrapper">
                <input type="checkbox" id="check2" class="checkbox">
                <label for="check2">Remove old versions</label>
            </div> -->
            <div class="content-button-wrapper">
                <button class="content-button status-button open close" @click="resetDialog">取消</button>
                <button class="content-button status-button" @click="submitDialog">确认</button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">

@import './newPage.scss';
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");

* {
    outline: none;
    box-sizing: border-box;
}

:root {
    --theme-bg-color: rgba(16 18 27 / 40%);
    --border-color: rgba(113 119 144 / 25%);
    --theme-color: #f9fafb;
    --inactive-color: rgb(113 119 144 / 78%);
    --body-font: "Poppins", sans-serif;
    --hover-menu-bg: rgba(12 15 25 / 30%);
    --content-title-color: #999ba5;
    --content-bg: rgb(146 151 179 / 13%);
    --button-inactive: rgb(249 250 251 / 55%);
    --dropdown-bg: #21242d;
    --dropdown-hover: rgb(42 46 60);
    --popup-bg: rgb(22 25 37);
    --search-bg: #14162b;
    --overlay-bg: rgba(36, 39, 59, 0.3);
    --scrollbar-bg: rgb(1 2 3 / 40%);
}

.light-mode {
    --theme-bg-color: rgb(255 255 255 / 31%);
    --theme-color: #3c3a3a;
    --inactive-color: #333333;
    --button-inactive: #3c3a3a;
    --search-bg: rgb(255 255 255 / 31%);
    --dropdown-bg: #f7f7f7;
    --overlay-bg: rgb(255 255 255 / 30%);
    --dropdown-hover: rgb(236 236 236);
    --border-color: rgb(255 255 255 / 35%);
    --popup-bg: rgb(255 255 255);
    --hover-menu-bg: rgba(255 255 255 / 35%);
    --scrollbar-bg: rgb(255 253 253 / 57%);
    --content-title-color: --theme-color;
}

html {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
}

body {
    font-family: var(--body-font);
    background-image: url(https://wallpapershome.com/images/wallpapers/macos-big-sur-1280x720-dark-wwdc-2020-22655.jpg);
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 2em;
    width: 100%;
    height: 100vh;

    @media screen and (max-width: 480px) {
        padding: 0.8em;
    }
}

.video-bg {
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;

    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

img {
    max-width: 100%;
}

.dark-light {
    position: fixed;
    bottom: 50px;
    right: 30px;
    background-color: var(--dropdown-bg);
    box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.2);
    padding: 8px;
    border-radius: 50%;
    z-index: 3;
    cursor: pointer;

    svg {
        width: 24px;
        flex-shrink: 0;
        fill: #ffce45;
        stroke: #ffce45;
        transition: 0.5s;
    }
}

.light-mode {
    .dark-light svg {
        fill: transparent;
        stroke: var(--theme-color);
    }

    .profile-img {
        border: 2px solid var(--theme-bg-color)
    }

    .content-section ul {
        background-color: var(--theme-bg-color);
    }

    .pop-up__title {
        border-color: var(--theme-color);
    }

    .dropdown.is-active ul {
        background-color: rgb(255 255 255 / 94%);
    }
}

body.light-mode:before,
body.light-mode .video-bg:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgb(255 255 255 / 45%) 100%);
    backdrop-filter: saturate(3);
}

.app {
    background-color: var(--theme-bg-color);
    max-width: 1250px;
    max-height: 860px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    width: 100%;
    border-radius: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    font-size: 15px;
    font-weight: 500;
}

.header {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    height: 58px;
    width: 100%;
    border-bottom: 1px solid var(--border-color);
    padding: 0 30px;
    white-space: nowrap;

    @media screen and (max-width: 480px) {
        padding: 0 16px;
    }

    &-menu {
        display: flex;
        align-items: center;

        a {
            padding: 20px 30px;
            text-decoration: none;
            color: var(--inactive-color);
            border-bottom: 2px solid transparent;
            transition: 0.3s;

            @media screen and (max-width: 610px) {
                &:not(.main-header-link) {
                    display: none;
                }
            }

            &.is-active,
            &:hover {
                color: var(--theme-color);
                border-bottom: 2px solid var(--theme-color);
            }
        }
    }
}

.notify {
    position: relative;

    &:before {
        content: "";
        position: absolute;
        background-color: #3a6df0;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        right: 20px;
        top: 16px;
    }

    @media screen and (max-width: 1055px) {
        display: none;
    }
}

.menu-circle {
    width: 15px;
    height: 15px;
    background-color: #f96057;
    border-radius: 50%;
    box-shadow: 24px 0 0 0 #f8ce52, 48px 0 0 0 #5fcf65;
    margin-right: 195px;
    flex-shrink: 0;

    @media screen and (max-width: 945px) {
        display: none;
    }
}

.search-bar {
    height: 40px;
    display: flex;
    width: 100%;
    max-width: 400px;
    padding-left: 16px;
    border-radius: 4px;

    input {
        width: 100%;
        height: 100%;
        border: none;
        background-color: var(--search-bg);
        border-radius: 4px;
        font-family: var(--body-font);
        font-size: 15px;
        font-weight: 500;
        padding: 0 20px 0 40px;
        box-shadow: 0 0 0 2px rgb(134 140 160 / 2%);
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56.966 56.966' fill='%23717790c7'%3e%3cpath d='M55.146 51.887L41.588 37.786A22.926 22.926 0 0046.984 23c0-12.682-10.318-23-23-23s-23 10.318-23 23 10.318 23 23 23c4.761 0 9.298-1.436 13.177-4.162l13.661 14.208c.571.593 1.339.92 2.162.92.779 0 1.518-.297 2.079-.837a3.004 3.004 0 00.083-4.242zM23.984 6c9.374 0 17 7.626 17 17s-7.626 17-17 17-17-7.626-17-17 7.626-17 17-17z'/%3e%3c/svg%3e");
        background-size: 14px;
        background-repeat: no-repeat;
        background-position: 16px 48%;
        color: var(--theme-color);

        &::placeholder {
            font-family: var(--body-font);
            color: var(--inactive-color);
            font-size: 15px;
            font-weight: 500;
        }
    }
}



.header-profile {
    display: flex;
    align-items: center;
    padding: 0 16px 0 40px;
    margin-left: auto;
    flex-shrink: 0;

    svg {
        width: 22px;
        color: #f9fafb;
        flex-shrink: 0;
    }
}

.notification {
    position: relative;

    &-number {
        position: absolute;
        background-color: #3a6df0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        right: -6px;
        top: -6px;
    }

    &+svg {
        margin-left: 22px;

        @media screen and (max-width: 945px) {
            display: none;
        }
    }
}

.profile-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--theme-color);
    margin-left: 22px;
}

.wide {

    .header-menu,
    .header-profile {
        display: none;
    }

    .search-bar {
        max-width: 600px;
        margin: auto;
        transition: 0.4s;
        box-shadow: 0 0 0 1px var(--border-color);
        padding-left: 0;
    }

    .menu-circle {
        margin-right: 0;
    }
}

.wrapper {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
}

.left-side {
    flex-basis: 240px;
    border-right: 1px solid var(--border-color);
    padding: 26px;
    overflow: auto;
    flex-shrink: 0;

    @media screen and (max-width: 945px) {
        display: none;
    }
}

.side-wrapper+.side-wrapper {
    margin-top: 20px;
}

.side-title {
    color: var(--inactive-color);
    margin-bottom: 14px;
}

.side-menu {
    display: flex;
    flex-direction: column;
    white-space: nowrap;

    a {
        text-decoration: none;
        color: var(--theme-color);
        display: flex;
        align-items: center;
        font-weight: 400;
        padding: 10px;
        font-size: 14px;
        border-radius: 6px;
        transition: 0.3s;

        &:hover {
            background-color: var(--hover-menu-bg);
        }
    }

    svg {
        width: 16px;
        margin-right: 8px;
    }
}

.updates {
    position: relative;
    top: 0;
    right: 0;
    margin-left: auto;
    width: 18px;
    height: 18px;
    font-size: 11px;
}

.main-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    height: 58px;
    flex-shrink: 0;

    .header-menu {
        margin-left: 150px;

        @media screen and (max-width: 1055px) {
            margin: auto;
        }

        a {
            padding: 20px 24px;
        }
    }
}

.main-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.menu-link-main {
    text-decoration: none;
    color: var(--theme-color);
    padding: 0 30px;

    @media screen and (max-width: 1055px) {
        display: none;
    }
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    color: var(--theme-color);
    padding: 20px 40px;
    height: 100%;
    overflow: auto;
    background-color: var(--theme-bg-color);
    width: calc(100vw - 130px);

    @media screen and (max-width: 510px) {
        padding: 20px;
    }

    &-header {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
        background-image: url("https://www.transparenttextures.com/patterns/cubes.png"),
            linear-gradient(to right top,
                #cf4af3,
                #e73bd7,
                #f631bc,
                #fd31a2,
                #ff3a8b,
                #ff4b78,
                #ff5e68,
                #ff705c,
                #ff8c51,
                #ffaa49,
                #ffc848,
                #ffe652);
        border-radius: 14px;
        padding: 20px 40px;

        @media screen and (max-width: 415px) {
            padding: 20px;
        }
    }

    &.overlay {
        pointer-events: none;
        transition: 0.3s;
        background-color: var(--overlay-bg);
    }
}

.overlay-app {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    pointer-events: all;
    background-color: rgba(36, 39, 59, 0.8);
    opacity: 0;
    visibility: hidden;
    transition: 0.3s;

    &.is-active {
        visibility: visible;
        opacity: 1;
    }
}

.img-content {
    font-weight: 500;
    font-size: 17px;
    display: flex;
    align-items: center;
    margin: 0;

    svg {
        width: 28px;
        margin-right: 14px;
    }
}

.content-text {
    font-weight: 400;
    font-size: 14px;
    margin-top: 16px;
    line-height: 1.7em;
    color: #ebecec;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.content-wrapper-context {
    max-width: 350px;
}

.content-button {
    background-color: #3a6df0;
    border: none;
    padding: 8px 26px;
    color: #fff;
    border-radius: 20px;
    margin-top: 16px;
    cursor: pointer;
    transition: 0.3s;
    white-space: nowrap;
}

.content-wrapper-img {
    width: 186px;
    object-fit: cover;
    margin-top: -25px;
    object-position: center;

    @media screen and (max-width: 570px) {
        width: 110px;
    }
}

.content-section {
    margin-top: 30px;
    display: flex;
    flex-direction: column;

    &-title {
        color: var(--content-title-color);
        margin-bottom: 14px;
    }

    ul {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: space-around;
        background-color: var(--content-bg);
        padding-left: 0;
        margin: 0;
        border-radius: 14px;
        border: 1px solid var(--theme-bg-color);
        cursor: pointer;

        li {
            list-style: none;
            padding: 10px 18px;
            display: flex;
            align-items: center;
            font-size: 16px;
            width: 100%;
            height: 100%;
            white-space: nowrap;
            transition: 0.3s;

            &:hover {
                background-color: var(--theme-bg-color);

                &:first-child {
                    border-radius: 13px 13px 0 0;
                }

                &:last-child {
                    border-radius: 0 0 13px 13px;
                }
            }

            &+li {
                border-top: 1px solid var(--border-color);
            }
        }

        svg {
            width: 28px;
            border-radius: 6px;
            margin-right: 16px;
            flex-shrink: 0;
        }
    }
}

.products {
    display: flex;
    align-items: center;
    width: 150px;

    @media screen and (max-width: 480px) {
        width: 120px;
    }
}

.status {
    margin-left: auto;
    width: 140px;
    font-size: 15px;
    position: relative;

    @media screen and (max-width: 700px) {
        display: none;
    }

    &-circle {
        width: 6px;
        height: 6px;
        background-color: #396df0;
        position: absolute;
        border-radius: 50%;
        top: 4px;
        left: -20px;

        &.green {
            background-color: #3bf083;
        }
    }

    &-button {
        font-size: 15px;
        margin-top: 0;
        padding: 6px 24px;

        @media screen and (max-width: 390px) {
            padding: 6px 14px;
        }

        &.open {
            background: none;
            color: var(--button-inactive);
            border: 1px solid var(--button-inactive);
        }

        &:not(.open):hover {
            color: #fff;
            border-color: #fff;
        }
    }
}

.content-button:not(.open):hover {
    background: #1e59f1;
}

.menu {
    width: 5px;
    height: 5px;
    background-color: var(--button-inactive);
    border-radius: 50%;
    box-shadow: 7px 0 0 0 var(--button-inactive), 14px 0 0 0 var(--button-inactive);
    margin: 0 12px;
}

@media screen and (max-width: 415px) {
    .adobe-product .menu {
        display: none;
    }
}

.dropdown {
    position: relative;
    height: 53px;
    width: 40px;
    top: -24px;
    display: flex;
    left: -5px;
    background: transparent;
    border: none;
    cursor: pointer;

    ul {
        position: absolute;
        background: var(--dropdown-bg);
        height: 110px;
        width: 120px;
        right: 0;
        top: 20px;
        pointer-events: none;
        opacity: 0;
        transform: translatey(10px);
        transition: all 0.4s ease;

        li a {
            text-decoration: none;
            color: var(--theme-color);
            font-size: 12px;
        }
    }
}

.dropdown.is-active {
    ul {
        opacity: 1;
        pointer-events: all;
        transform: translatey(25px);

        li:hover {
            background-color: var(--dropdown-hover);
        }
    }
}

.button-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 187px;
    margin-left: auto;

    @media screen and (max-width: 480px) {
        width: auto;
    }
}

.pop-up {
    position: absolute;
    padding: 30px 40px;
    top: 50%;
    left: 50%;
    transform: (translate(-50%, -50%));
    overflow-y: auto;
    box-shadow: 0px 6px 30px rgba(0, 0, 0, 0.4);
    transition: all 0.3s;
    z-index: 10;
    background-color: var(--popup-bg);
    width: 500px;
    display: none;
    // visibility: hidden;
    // opacity: 0;

    border-radius: 6px;
    display: flex;
    flex-direction: column;
    white-space: normal;

    @media screen and (max-width: 570px) {
        width: 100%;
    }

    &.visible {
        visibility: visible;
        opacity: 1;
    }

    &__title {
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &__subtitle {
        white-space: normal;
        margin: 20px 0;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.8em;

        a {
            color: var(--theme-color);
        }
    }
}

.content-button-wrapper .content-button.status-button.open.close {
    width: auto;
}

.content-section .close {
    margin-right: 0;
    width: 24px;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 400;

    &+.checkbox-wrapper {
        margin: 20px 0 40px;
    }
}

.checkbox {
    display: none;
}

.checkbox+label {
    display: flex;
    align-items: center;

    &:before {
        content: "";
        margin-right: 10px;
        width: 15px;
        height: 15px;
        border: 1px solid var(--theme-color);
        border-radius: 4px;
        cursor: pointer;
        flex-shrink: 0;
    }
}

.checkbox:checked+label:before {
    background-color: #3a6df0;
    border-color: #3a6df0;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' class='feather feather-check'%3e%3cpath d='M20 6L9 17l-5-5'/%3e%3c/svg%3e");
    background-position: 50%;
    background-size: 12px;
    background-repeat: no-repeat;
}

.content-button-wrapper {
    margin-top: auto;
    margin-left: auto;

    .open {
        margin-right: 8px;
    }
}

.apps-card {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    width: calc(100% + 20px);
}

.app-card {
    display: flex;
    flex-direction: column;
    width: calc(33.3% - 40px);
    font-size: 16px;
    background-color: var(--content-bg);
    border-radius: 14px;
    border: 1px solid var(--theme-bg-color);
    padding: 20px;
    cursor: pointer;
    transition: 0.3s ease;

    &:hover {
        transform: scale(1.02);
        background-color: var(--theme-bg-color);
    }

    svg {
        width: 28px;
        border-radius: 6px;
        margin-right: 12px;
        flex-shrink: 0;
    }

    &+.app-card {
        margin-left: 20px;
    }

    span {
        display: flex;
        align-items: center;
    }

    &__subtext {
        font-size: 14px;
        font-weight: 400;
        line-height: 1.6em;
        margin-top: 20px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 20px;
    }

    &-buttons {
        display: flex;
        align-items: center;
        margin-left: auto;
        margin-top: 16px;
    }

    @media screen and (max-width: 1110px) {
        width: calc(50% - 20px);

        &:last-child {
            margin-top: 20px;
            margin-left: 0px;
        }
    }

    @media screen and (max-width: 565px) {
        width: calc(100% - 20px);
        margin-top: 20px;

        &+.app-card {
            margin-left: 0;
        }
    }
}

::-webkit-scrollbar {
    width: 6px;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: var(--scrollbar-bg);
    border-radius: 10px;
}
</style>