<template>
  <div class="bg-gray-300 dark:bg-gray-900 h-screen flex flex-col">
    <!-- <div class="page-header">
      <form @submit.prevent="addItem">
        <input v-model="newItem" placeholder="Add item" name="newTodo" autocomplete="off" />
        <button type="submit">Add</button>
      </form>
      <ul>
        <li v-for="(item, index) in todoLists" :key="index">{{ item }}</li>
      </ul>
    </div> -->
    <Container
      class="h-full flex overflow-x-auto gap-8 p-8"
      group-name="cols"
      tag="div"
      orientation="horizontal"
      @drop="onColumnDrop($event)"
    >
      <Draggable
        class="bg-gray-200 dark:bg-gray-700 rounded-lg h-full w-96 flex-shrink-0 shadow-xl"
        v-for="column in scene.children"
        :key="column.id"
      >
        <div class="h-full flex flex-col">
           <!-- header -->
          <div
            class="cursor-move rounded-t-lg p-4 space-x-4 bg-primary text-white flex space-x-2"
          >
            <HandIcon class="h-6 w-6"></HandIcon>
            <span class="text-lg">{{ column.name }}</span>
          </div>
          <!-- column  -->
          <Container
            class="flex-grow overflow-y-auto overflow-x-hidden"
            group-name="col-items"
            :shouldAcceptDrop="
              (e, payload) => e.groupName === 'col-items' && !payload.loading
            "
            :get-child-payload="getCardPayload(column.id)"
            :drop-placeholder="{
              className: `bg-primary bg-opacity-20  
            border-dotted border-2 
            border-primary rounded-lg mx-4 my-2`,
              animationDuration: '200',
              showOnTop: true,
            }"
            drag-class="bg-primary dark:bg-primary 
            border-2 border-primary-hover text-white 
            transition duration-100 ease-in z-50
            transform rotate-6 scale-110"
            drop-class="transition duration-100 
            ease-in z-50 transform 
            -rotate-2 scale-90"
            @drop="(e) => onCardDrop(column.id, e)"
          >
             <!-- Items  -->
            <template v-for="item in column.children">
              <Draggable :key="item.id" :item="item" v-if="item">
                <div
                  class="cursor-move my-2 mx-4 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 hover:border-2 border-primary"
                >
                  <div
                    v-if="item.loading"
                    class="flex space-x-2 bg-gray-50 text-gray-900 dark:text-gray-200 dark:bg-gray-900 px-4 py-2 rounded-t-lg"
                  >
                    <RefreshIcon
                      class="w-6 h-6 animate-spin"
                      viewBox="0 0 24 24"
                    ></RefreshIcon>
                    <span>Processing...</span>
                  </div>
                  <div class="p-4 space-y-2">
                    <div
                      class="rounded-lg bg-primary p-2 w-max h-max inline-block box-content"
                    >
                      {{ emoji }}
                    </div>
                    <p>{{ item.data }}</p>
                  </div>
                </div>
              </Draggable>
            </template>
          </Container>
        </div>
      </Draggable>
    </Container>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { HandIcon, CodeIcon, RefreshIcon } from '@heroicons/vue/outline'
import {
  applyDrag,
  generateItems,
  generateWords,
  getRandomEmoji,
} from '../utils/helpers'
const newTodo = ref('')
const defaultData = [
  {
    done: false,
    content: 'Write a blog post',
  },
]
const todos = []
const todoLists = [
  {
    id: `column1`,
    type: 'todo',
    name: 'todo',
    props: {
      orientation: 'vertical',
    },
    children: [
      {
        type: 'todo',
        id: `0`,
        loading: false,
        data: 'lina',
      },
      {
        type: 'todo',
        id: `0`,
        loading: false,
        data: 'fg',
      },
      {
        type: 'todo',
        id: `0`,
        loading: false,
        data: 'yike',
      },
    ],
  },
  {
    id: `column2`,
    type: 'doing',
    name: 'doing',
    props: {
      orientation: 'vertical',
    },
    children: [
      {
        type: 'doing',
        id: `0`,
        loading: false,
        data: 'lina',
      },
      {
        type: 'doing',
        id: `0`,
        loading: false,
        data: 'fg',
      },
      {
        type: 'doing',
        id: `0`,
        loading: false,
        data: 'yike',
      },
    ],
  },
  {
    id: `column3`,
    type: 'done',
    name: 'done',
    props: {
      orientation: 'vertical',
    },
    children: [
      {
        type: 'done',
        id: `0`,
        loading: false,
        data: 'lina',
      },
      {
        type: 'done',
        id: `0`,
        loading: false,
        data: 'fg',
      },
      {
        type: 'done',
        id: `0`,
        loading: false,
        data: 'yike',
      },
    ],
  },
]
// mock
const scene = {
  type: 'container',
  props: {
    orientation: 'horizontal',
  },
  children: todoLists,
}
export default {
  components: { Container, Draggable, HandIcon, CodeIcon, RefreshIcon },
  data() {
    return {
      scene,
      emoji: getRandomEmoji(),
      newItem: '',
      todoItems: [],
    }
  },
  mounted() {
    this.getTodo();
  },
  methods: {
    getTodo() {
      // 读取 localStorage 中的数据
      const storedItems = JSON.parse(localStorage.getItem('items'))
      if (storedItems) {
        this.todoItems = storedItems
      }
    },
    addItem() {
      // 添加新数据到数组
      this.todoItems.push(this.newItem)
      this.newItem = ''
      this.saveData();
    },
    addTodo() {
      if (newTodo.value) {
        this.todos.value.push({
          done: false,
          content: newTodo.value,
        })
        this.newTodo.value = ''
      }
      this.saveData()
    },
    saveData() {
      // 存储更新后的数据到 localStorage
      localStorage.setItem('items', JSON.stringify(this.todoItems))
    },
    getColumnHeightPx() {
      let kanban = document.getElementById('kanbanContainer')
      return kanban ? kanban.offsetHeight - 122 : 0
    },
    onColumnDrop(dropResult) {
      const scene = Object.assign({}, this.scene)
      scene.children = applyDrag(scene.children, dropResult)
      this.scene = scene
    },
    onCardDrop(columnId, dropResult) {
      // type=dropResult.payload.type

      // check if element where ADDED or REMOVED in current collumn
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const scene = Object.assign({}, this.scene)
        const column = scene.children.filter((p) => p.id === columnId)[0]
        const itemIndex = scene.children.indexOf(column)
        const newColumn = Object.assign({}, column)

        // check if element was ADDED in current column
        if (dropResult.removedIndex == null && dropResult.addedIndex >= 0) {
          // your action / api call
          dropResult.payload.loading = true
          // simulate api call
          setTimeout(function () {
            dropResult.payload.loading = false
          }, 1000)
        }
        
        newColumn.children = applyDrag(newColumn.children, dropResult)
        scene.children.splice(itemIndex, 1, newColumn)
        this.scene = scene
      }
    },
    getCardPayload(columnId) {
      return (index) => {
        return this.scene.children.filter((p) => p.id === columnId)[0].children[
          index
        ]
      }
    },
  },
}
</script>
<style>
/** NB: dont remove, 
* When using orientation="horizontal" it auto sets "display: table"
* In this case we need flex and not display table  
*/
.smooth-dnd-container.horizontal {
  display: flex !important;
}
</style>
