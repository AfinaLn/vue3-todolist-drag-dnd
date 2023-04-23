<template>
  <div class="page bg-gray-300 dark:bg-gray-900 h-screen flex flex-col">
    <div class="page-header">
      <div class="page-header-item">asfd</div>
      <div class="page-header-input">
        <el-input
          v-model="newTodo"
          placeholder="请输入..."
          clearable
          class="mr20"
          autocomplete="off"
          name="news"
          @input="change($event)"
          @change="addTodo($event)"
        />
        <el-button type="primary" @click="addTodo($event)">提交</el-button>
      </div>
      <div class="page-header-item">asfd</div>
    </div>
    <div class="page-content flex-grow p-4">
      <Container
        class="h-full flex overflow-x-auto gap-8 p-8"
        group-name="cols"
        tag="div"
        orientation="horizontal"
        @drop="onColumnDrop($event)"
      >
        <Draggable
          class="bg-gray-200 dark:bg-gray-700 rounded-lg h-full w-96 flex-shrink-0 shadow-xl"
          v-for="(column, index) in scene.children"
          :key="index"
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
              class="page-content-column flex-grow overflow-y-auto overflow-x-hidden"
              group-name="col-items"
              :shouldAcceptDrop="
                (e, payload) => e.groupName === 'col-items' && !payload.loading
              "
              :get-child-payload="getCardPayload(column.type)"
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
              @drop="(e) => onCardDrop(column.type, e)">
              <!-- Items  -->
              <template v-for="item in column.children">
                <Draggable :key="item.id" :item="item" v-if="item">
                  <div
                    class=" cursor-move my-2 mx-4 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 hover:border-2 border-primary "
                  >
                    <!-- <div class="list-left"> list
                      <el-icon class="el-input_icon">
                        <HelpFilled  size="6px" :color="priorityColor[item.priority]" /></el-icon>
                      <span class="list-left-name"> {{ item.data }}</span> 
                    </div>
                    <div class="list-right ">
                      <div class="list-right-date" >{{ item.dateName }}</div>
                      <div>
                        <el-icon class="el-input_icon">
                        <HelpFilled  size="6px" :color="priorityColor[item.priority]" /></el-icon>
                      </div>
                    </div> -->
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
                        class="rounded-lg p-2 w-max  inline-block box-content"
                      >
                       <el-icon class="el-input_icon">
                        <HelpFilled  size="6px" :color="priorityColor[item.priority]" /></el-icon>
                        {{ item.data }}
                      </div>
                      <div class="item">{{ item.dateName }}</div>
                    </div>
                  </div>
                </Draggable>
              </template>
            </Container>
          </div>
        </Draggable>
      </Container>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { HandIcon, RefreshIcon } from '@heroicons/vue/outline'
import 'element-plus/dist/index.css';
import { ElButton, ElInput, ElIcon } from 'element-plus'
import { Edit, Check, Message, HelpFilled  } from '@element-plus/icons-vue'
const form = reactive({
  name: '',
})
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
    type: 'todo',
    name: 'todo',
    props: {
      orientation: 'vertical',
    },
    children: [
      {
        type: 'todo',
        loading: false,
        data: 'lina',
        date: 'today',
        dateName: '今天',
        priority:'high',
      },
    ],
  },
  {
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
        data: 'fg',
        date: 'today',
        dateName: '今天',
        priority:'low',
      },
    ],
  },
  {
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
        data: 'yike',
        date: 'today',
        dateName: '今天',
        priority:'medium',
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
const emojis = [
  '😄',
  '😃',
  '😀',
  '😊',
  '😉',
  '😍',
  '😘',
  '😚',
  '😗',
  '😙',
  '😜',
  '😝',
  '😛',
  '😳',
  '😁',
  '😔',
  '😌',
  '😒',
  '😞',
  '😣',
  '😢',
  '😂',
  '😭',
  '😪',
  '😥',
  '😰',
  '😅',
  '😓',
  '😩',
  '😫',
  '😨',
  '😱',
  '😠',
  '😡',
  '😤',
  '😖',
  '😆',
  '😋',
  '😷',
  '😎',
  '😴',
  '😵',
  '😲',
  '😟',
  '😦',
  '😧',
  '😈',
  '👿',
  '😮',
  '😬',
  '😐',
  '😕',
  '😯',
  '😶',
  '😇',
  '😏',
  '😑',
  '👲',
  '👳',
  '👮',
  '👷',
  '💂',
  '👶',
  '👦',
  '👧',
  '👨',
  '👩',
  '👴',
  '👵',
  '👱',
  '👼',
  '👸',
  '😺',
  '😸',
  '😻',
  '😽',
  '😼',
  '🙀',
  '😿',
  '😹',
  '😾',
  '👹',
  '👺',
  '🙈',
  '🙉',
  '🙊',
  '💀',
  '👽',
  '💩',
  '🔥',
  '✨',
  '🌟',
  '💫',
  '💥',
  '💢',
  '💦',
  '💧',
  '💤',
  '💨',
  '👂',
  '👀',
  '👃',
  '👅',
  '👄',
  '👍',
  '👎',
  '👌',
  '👊',
  '✊',
  '✌',
  '👋',
  '✋',
  '👐',
  '👆',
  '👇',
  '👉',
  '👈',
  '🙌',
  '🙏',
  '☝',
  '👏',
  '💪',
  '🚶',
  '🏃',
  '💃',
  '👫',
  '👪',
  '👬',
  '👭',
  '💏',
  '💑',
  '👯',
  '🙆',
  '🙅',
  '💁',
  '🙋',
  '💆',
  '💇',
  '💅',
  '👰',
  '🙎',
  '🙍',
  '🙇',
  '🎩',
  '👑',
  '👒',
  '👟',
  '👞',
  '👡',
  '👠',
  '👢',
  '👕',
  '👔',
  '👚',
  '👗',
  '🎽',
  '👖',
  '👘',
  '👙',
  '💼',
  '👜',
  '👝',
  '👛',
  '👓',
  '🎀',
  '🌂',
  '💄',
  '💛',
  '💙',
  '💜',
  '💚',
  '❤',
  '💔',
  '💗',
  '💓',
  '💕',
  '💖',
  '💞',
  '💘',
  '💌',
  '💋',
  '💍',
  '💎',
  '👤',
  '👥',
  '💬',
  '👣',
  '💭',
  '🐶',
  '🐺',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🐸',
  '🐯',
  '🐨',
  '🐻',
  '🐷',
  '🐽',
  '🐮',
  '🐗',
  '🐵',
  '🐒',
  '🐴',
  '🐑',
  '🐘',
  '🐼',
  '🐧',
  '🐦',
  '🐤',
  '🐥',
  '🐣',
  '🐔',
  '🐍',
  '🐢',
  '🐛',
  '🐝',
  '🐜',
  '🐞',
  '🐌',
  '🐙',
  '🐚',
  '🐠',
  '🐟',
  '🐬',
  '🐳',
  '🐋',
  '🐄',
  '🐏',
  '🐀',
  '🐃',
  '🐅',
  '🐇',
  '🐉',
  '🐎',
  '🐐',
  '🐓',
  '🐕',
  '🐖',
  '🐁',
  '🐂',
  '🐲',
  '🐡',
  '🐊',
  '🐫',
  '🐪',
  '🐆',
  '🐈',
  '🐩',
  '🐾',
  '💐',
  '🌸',
  '🌷',
  '🍀',
  '🌹',
  '🌻',
  '🌺',
  '🍁',
  '🍃',
  '🍂',
  '🌿',
  '🌾',
  '🍄',
  '🌵',
  '🌴',
  '🌲',
  '🌳',
  '🌰',
  '🌱',
  '🌼',
  '🌐',
  '🌞',
  '🌝',
  '🌚',
  '🌑',
  '🌒',
  '🌓',
  '🌔',
  '🌕',
  '🌖',
  '🌗',
  '🌘',
  '🌜',
  '🌛',
  '🌙',
  '🌍',
  '🌎',
  '🌏',
  '🌋',
  '🌌',
  '🌠',
  '⭐',
  '☀',
  '⛅',
  '☁',
  '⚡',
  '☔',
  '❄',
  '⛄',
  '🌀',
  '🌁',
  '🌈',
  '🌊',
  '🎍',
  '💝',
  '🎎',
  '🎒',
  '🎓',
  '🎏',
  '🎆',
  '🎇',
  '🎐',
  '🎑',
  '🎃',
  '👻',
  '🎅',
  '🎄',
  '🎁',
  '🎋',
  '🎉',
  '🎊',
  '🎈',
  '🎌',
  '🔮',
  '🎥',
  '📷',
  '📹',
  '📼',
  '💿',
  '📀',
  '💽',
  '💾',
  '💻',
  '📱',
  '☎',
  '📞',
  '📟',
  '📠',
  '📡',
  '📺',
  '📻',
  '🔊',
  '🔉',
  '🔈',
  '🔇',
  '🔔',
  '🔕',
  '📢',
  '📣',
  '⏳',
  '⌛',
  '⏰',
  '⌚',
  '🔓',
  '🔒',
  '🔏',
  '🔐',
  '🔑',
  '🔎',
  '💡',
  '🔦',
  '🔆',
  '🔅',
  '🔌',
  '🔋',
  '🔍',
  '🛁',
  '🛀',
  '🚿',
  '🚽',
  '🔧',
  '🔩',
  '🔨',
  '🚪',
  '🚬',
  '💣',
  '🔫',
  '🔪',
  '💊',
  '💉',
  '💰',
  '💴',
  '💵',
  '💷',
  '💶',
  '💳',
  '💸',
  '📲',
  '📧',
  '📥',
  '📤',
  '✉',
  '📩',
  '📨',
  '📯',
  '📫',
  '📪',
  '📬',
  '📭',
  '📮',
  '📦',
  '📝',
  '📄',
  '📃',
  '📑',
  '📊',
  '📈',
  '📉',
  '📜',
  '📋',
  '📅',
  '📆',
  '📇',
  '📁',
  '📂',
  '✂',
  '📌',
  '📎',
  '✒',
  '✏',
  '📏',
  '📐',
  '📕',
  '📗',
  '📘',
  '📙',
  '📓',
  '📔',
  '📒',
  '📚',
  '📖',
  '🔖',
  '📛',
  '🔬',
  '🔭',
  '📰',
  '🎨',
  '🎬',
  '🎤',
  '🎧',
  '🎼',
  '🎵',
  '🎶',
  '🎹',
  '🎻',
  '🎺',
  '🎷',
  '🎸',
  '👾',
  '🎮',
  '🃏',
  '🎴',
  '🀄',
  '🎲',
  '🎯',
  '🏈',
  '🏀',
  '⚽',
  '⚾',
  '🎾',
  '🎱',
  '🏉',
  '🎳',
  '⛳',
  '🚵',
  '🚴',
  '🏁',
  '🏇',
  '🏆',
  '🎿',
  '🏂',
  '🏊',
  '🏄',
  '🎣',
  '☕',
  '🍵',
  '🍶',
  '🍼',
  '🍺',
  '🍻',
  '🍸',
  '🍹',
  '🍷',
  '🍴',
  '🍕',
  '🍔',
  '🍟',
  '🍗',
  '🍖',
  '🍝',
  '🍛',
  '🍤',
  '🍱',
  '🍣',
  '🍥',
  '🍙',
  '🍘',
  '🍚',
  '🍜',
  '🍲',
  '🍢',
  '🍡',
  '🍳',
  '🍞',
  '🍩',
  '🍮',
  '🍦',
  '🍨',
  '🍧',
  '🎂',
  '🍰',
  '🍪',
  '🍫',
  '🍬',
  '🍭',
  '🍯',
  '🍎',
  '🍏',
  '🍊',
  '🍋',
  '🍒',
  '🍇',
  '🍉',
  '🍓',
  '🍑',
  '🍈',
  '🍌',
  '🍐',
  '🍍',
  '🍠',
  '🍆',
  '🍅',
  '🌽',
  '🏠',
  '🏡',
  '🏫',
  '🏢',
  '🏣',
  '🏥',
  '🏦',
  '🏪',
  '🏩',
  '🏨',
  '💒',
  '⛪',
  '🏬',
  '🏤',
  '🌇',
  '🌆',
  '🏯',
  '🏰',
  '⛺',
  '🏭',
  '🗼',
  '🗾',
  '🗻',
  '🌄',
  '🌅',
  '🌃',
  '🗽',
  '🌉',
  '🎠',
  '🎡',
  '⛲',
  '🎢',
  '🚢',
  '⛵',
  '🚤',
  '🚣',
  '⚓',
  '🚀',
  '✈',
  '💺',
  '🚁',
  '🚂',
  '🚊',
  '🚉',
  '🚞',
  '🚆',
  '🚄',
  '🚅',
  '🚈',
  '🚇',
  '🚝',
  '🚋',
  '🚃',
  '🚎',
  '🚌',
  '🚍',
  '🚙',
  '🚘',
  '🚗',
  '🚕',
  '🚖',
  '🚛',
  '🚚',
  '🚨',
  '🚓',
  '🚔',
  '🚒',
  '🚑',
  '🚐',
  '🚲',
  '🚡',
  '🚟',
  '🚠',
  '🚜',
  '💈',
  '🚏',
  '🎫',
  '🚦',
  '🚥',
  '⚠',
  '🚧',
  '🔰',
  '⛽',
  '🏮',
  '🎰',
  '♨',
  '🗿',
  '🎪',
  '🎭',
  '📍',
  '🚩',
  '⬆',
  '⬇',
  '⬅',
  '➡',
  '🔠',
  '🔡',
  '🔤',
  '↗',
  '↖',
  '↘',
  '↙',
  '↔',
  '↕',
  '🔄',
  '◀',
  '▶',
  '🔼',
  '🔽',
  '↩',
  '↪',
  'ℹ',
  '⏪',
  '⏩',
  '⏫',
  '⏬',
  '⤵',
  '⤴',
  '🆗',
  '🔀',
  '🔁',
  '🔂',
  '🆕',
  '🆙',
  '🆒',
  '🆓',
  '🆖',
  '📶',
  '🎦',
  '🈁',
  '🈯',
  '🈳',
  '🈵',
  '🈴',
  '🈲',
  '🉐',
  '🈹',
  '🈺',
  '🈶',
  '🈚',
  '🚻',
  '🚹',
  '🚺',
  '🚼',
  '🚾',
  '🚰',
  '🚮',
  '🅿',
  '♿',
  '🚭',
  '🈷',
  '🈸',
  '🈂',
  'Ⓜ',
  '🛂',
  '🛄',
  '🛅',
  '🛃',
  '🉑',
  '㊙',
  '㊗',
  '🆑',
  '🆘',
  '🆔',
  '🚫',
  '🔞',
  '📵',
  '🚯',
  '🚱',
  '🚳',
  '🚷',
  '🚸',
  '⛔',
  '✳',
  '❇',
  '❎',
  '✅',
  '✴',
  '💟',
  '🆚',
  '📳',
  '📴',
  '🅰',
  '🅱',
  '🆎',
  '🅾',
  '💠',
  '➿',
  '♻',
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
  '⛎',
  '🔯',
  '🏧',
  '💹',
  '💲',
  '💱',
  '©',
  '®',
  '™',
  '〽',
  '〰',
  '🔝',
  '🔚',
  '🔙',
  '🔛',
  '🔜',
  '❌',
  '⭕',
  '❗',
  '❓',
  '❕',
  '❔',
  '🔃',
  '🕛',
  '🕧',
  '🕐',
  '🕜',
  '🕑',
  '🕝',
  '🕒',
  '🕞',
  '🕓',
  '🕟',
  '🕔',
  '🕠',
  '🕕',
  '🕖',
  '🕗',
  '🕘',
  '🕙',
  '🕚',
  '🕡',
  '🕢',
  '🕣',
  '🕤',
  '🕥',
  '🕦',
  '✖',
  '➕',
  '➖',
  '➗',
  '♠',
  '♥',
  '♣',
  '♦',
  '💮',
  '💯',
  '✔',
  '☑',
  '🔘',
  '🔗',
  '➰',
  '🔱',
  '🔲',
  '🔳',
  '◼',
  '◻',
  '◾',
  '◽',
  '▪',
  '▫',
  '🔺',
  '⬜',
  '⬛',
  '⚫',
  '⚪',
  '🔴',
  '🔵',
  '🔻',
  '🔶',
  '🔷',
  '🔸',
  '🔹',
]

export default {
  components: { Container, Draggable, ElButton, ElInput,ElIcon,HelpFilled , },
  data() {
    return {
      scene,
      emoji: '😍',
      newItem: '',
      todoItems: [],
      priorityColor:{
        'high':'#DB3B26',
        'medium':'#FFB95B',
        'low':'#169BFA',
        'generally':''
      },
    }
  },
  beforeCreated() {
    this.emoji = this.getRandomEmoji()
  },
  mounted() {
    this.getTodo()
  },
  methods: {
    change() {
      this.$forceUpdate()
    },
    addTodo() {
      const obj = {
        type: 'todo',
        id: this.generateId(),
        loading: false,
        data: this.newTodo,
        date: 'today',
        dateName: '今天',
        priority:'generally',
      }
      const data = scene.children
      const todoIndex = data.findIndex((column) => column.type === 'todo')
      const todoColumn = data[todoIndex] // 获取该列的对象
      const newTodoChildren = [obj, ...todoColumn.children]

      const newData = [
        ...data.slice(0, todoIndex),
        { ...todoColumn, children: newTodoChildren },
        ...data.slice(todoIndex + 1),
      ]
      this.scene.children = newData
      this.newTodo = ''
      this.change()
      this.saveData()
    },
    getTodo() {
      // 读取 localStorage 中的数据
      const storedItems = JSON.parse(localStorage.getItem('items'))
      console.log('storedItems,', storedItems)
      debugger
      if (storedItems) {
        this.scene.children = storedItems
      }
    },
    addItem() {
      // 添加新数据到数组
      this.todoItems.push(this.newItem)
      this.newItem = ''
      this.saveData()
    },
    saveData() {
      // 存储更新后的数据到 localStorage
      localStorage.setItem('items', JSON.stringify(this.scene.children))
    },
    getColumnHeightPx() {
      let kanban = document.getElementById('kanbanContainer')
      return kanban ? kanban.offsetHeight - 122 : 0
    },
    onColumnDrop(dropResult) {
      const scene = Object.assign({}, this.scene)
      scene.children = this.applyDrag(scene.children, dropResult)
      this.scene = scene
      this.saveData()
    },
    onCardDrop(columnType, dropResult) {
      debugger
      console.log('dropResult', dropResult)
      // type=dropResult.payload.type
      debugger
      // check if element where ADDED or REMOVED in current collumn
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const scene = Object.assign({}, this.scene)
        const column = scene.children.filter((p) => p.type === columnType)[0]
        const itemIndex = scene.children.indexOf(column)
        const newColumn = Object.assign({}, column)

        console.log('itemIndex', dropResult)
        console.log('newColumn', newColumn)
        // check if element was ADDED in current column
        if (dropResult.removedIndex == null && dropResult.addedIndex >= 0) {
          // your action / api call
          dropResult.payload.loading = true
          // simulate api call
          setTimeout(function () {
            dropResult.payload.loading = false
          }, 1000)
        }

        newColumn.children = this.applyDrag(newColumn.children, dropResult)
        scene.children.splice(itemIndex, 1, newColumn)
        this.scene = scene
        this.saveData()
      }
    },
    getCardPayload(columnType) {
      return (index) => {
        return this.scene.children.filter((p) => p.type === columnType)[0]
          .children[index]
      }
    },
    applyDrag(arr, dragResult) {
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
    },
    getRandomEmoji() {
      return emojis[Math.floor(Math.random() * emojis.length)]
    },
    generateId() {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let id = ''
      for (let i = 0; i < 5; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return id
    },
  },
}
</script>
<style scoped lang="scss">
@import './HomePage.scss';
/** NB: dont remove, 
* When using orientation="horizontal" it auto sets "display: table"
* In this case we need flex and not display table  
*/
.smooth-dnd-container.horizontal {
  display: flex !important;
}
// .ml20{
//   margin-left: 20px;
// }
</style>
