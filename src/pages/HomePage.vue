<template>
  <!-- <div id="sky"></div> -->
  <!-- <div id="title"></div> -->

  <div id="sky" class="page bg-gray-300 dark:bg-gray-900 h-screen flex flex-col">
    <div id="sun_yellow"></div>
    <div id="sun_red"></div>
    <div id="clouds"></div>
    <div id="ground"></div>
    <!-- <div id="night"></div> -->
    <div id="night" class="canvas-box">
      <canvas id="canvas">你的浏览器不支持canvas</canvas>
    </div>
    <div id="stars"></div>
    <div id="sstar"></div>
    <div id="moon"></div>
    <div class="page-header">
      <div class="page-header-item">asfd</div>
      <div class="page-header-input">
        <el-input v-model="newTodo" placeholder="例如：每天11:30定外卖" clearable class="mr20" autocomplete="off" name="news"
          maxlength="18" show-word-limit @input="change($event)" />
        <el-button type="primary" @click="addTodo($event)">提交</el-button>
      </div>
      <div class="page-header-item">asfd</div>
    </div>
    <div class="page-content flex-grow p-4">
      <Container class="h-full flex overflow-x-auto gap-8 p-8" group-name="cols" tag="div" orientation="horizontal"
        @drop="onColumnDrop($event)">
        <Draggable class="dragg-wrapper-bg bg-gray-200 dark:bg-gray-700 rounded-lg h-full w-96 flex-shrink-0 shadow-xl"
          v-for="(column, index) in scene.children" :key="index">
          <div class="h-full flex flex-col">
            <!-- header -->
            <div class="cursor-move rounded-t-lg p-4 space-x-4 bg-primary text-white flex space-x-2">
              <span class="text-lg font-header-30">{{ column.name }}</span>
            </div>
            <!-- column  -->
            <Container class="page-content-column flex-grow overflow-y-auto overflow-x-hidden" group-name="col-items"
              :shouldAcceptDrop="(e, payload) => e.groupName === 'col-items' && !payload.loading
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
                  <div @click="openMessage(item)"
                    class="cursor-move my-2 mx-4 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 hover:border-2 border-primary">
                    <div class="list space-y-2 flex-row space-between">
                      <div class="list-left rounded-lg p-2 w-max inline-block box-content flex-row">
                        <el-icon class="el-input_icon" size="20px" :color="priorityColor[item.priority]">
                          <HelpFilled />
                        </el-icon>
                        <span class="list-left-name">{{ item.content }}</span>
                      </div>
                      <div class="list-right cursor">
                        <div class="list-right-date">{{ item.dateName }}</div>
                        <div class="list-right-icon" v-show="item.isRepeat">
                          <el-icon size="14" color="#475669">
                            <Refresh />
                          </el-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </Draggable>
              </template>
            </Container>
          </div>
        </Draggable>
      </Container>
    </div>

    <el-dialog v-model="dialogFormVisible" title="日期设置">
      <el-input v-model="newTodo" autocomplete="off" />
      <vue-hash-calendar />
      <el-form :model="form">
        <el-form-item label="Promotion name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Zones" :label-width="formLabelWidth">
          <el-select v-model="form.region" placeholder="Please select a zone">
            <el-option label="Zone No.1" value="shanghai" />
            <el-option label="Zone No.2" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">重置</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { HandIcon, RefreshIcon } from '@heroicons/vue/outline'
import 'element-plus/dist/index.css'
import {
  ElButton,
  ElInput,
  ElIcon,
  ElTooltip,
  ElText,
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
} from 'element-plus'
import VueHashCalendar from 'vue3-hash-calendar'
import 'vue3-hash-calendar/es/index.css'
import {
  Edit,
  Check,
  Message,
  HelpFilled,
  Refresh,
} from '@element-plus/icons-vue'



const gridData = [
  {
    date: '2016-05-02',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
  {
    date: '2016-05-04',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
  {
    date: '2016-05-01',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
  {
    date: '2016-05-03',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
]
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
    name: 'Todo',
    props: {
      orientation: 'vertical',
    },
    children: [
      {
        type: 'todo',
        loading: false,
        content: '下班后去超市买零食',
        date: 'today',
        dateName: '今天',
        priority: 'low',
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
        id: `0`,
        loading: false,
        content: '表单校验bug修复',
        date: 'today',
        dateName: '今天',
        priority: 'high',
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
        id: `0`,
        loading: false,
        content: '准备晨会内容',
        date: 'today',
        dateName: '今天',
        priority: 'medium',
        isRepeat: 'day',
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
  components: {
    Container,
    Draggable,
    ElButton,
    ElInput,
    ElIcon,
    HelpFilled,
    ElTooltip,
    ElText,
    Refresh,
    VueHashCalendar,
    ElDialog,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
  },
  data() {
    return {
      scene,
      emoji: '😍',
      priorityColor: {
        high: '#DB3B26',
        medium: '#FFB95B',
        low: '#169BFA',
        nomal: '#9da1aa',
      },
      // dialogFormVisible:false
    }
  },
  beforeCreated() {
    this.emoji = this.getRandomEmoji()
  },
  setup() {
    const dialogFormVisible = ref(true)
    const formLabelWidth = '140px'

    const form = reactive({
      name: '',
      region: '',
      date1: '',
      date2: '',
      delivery: false,
      type: [],
      resource: '',
      desc: '',
    })
    return {form,dialogFormVisible,formLabelWidth}
  },
  mounted() {
    this.getTodo()
    this.animation()
    this.meteor()
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
        content: this.newTodo,
        date: 'today',
        dateName: '今天',
        priority: 'nomal',
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
    openMessage() {
      console.log('bbb', this.dialogFormVisible)
      this.dialogFormVisible = true
      console.log('aaaa', this.dialogFormVisible)
    },
    getTodo() {
      // 读取 localStorage 中的数据
      const storedItems = JSON.parse(localStorage.getItem('items'))
      console.log('storedItems,', storedItems)
      if (storedItems) {
        this.scene.children = storedItems
      }
    },
    saveData() {
      // 存储更新后的数据到 localStorage
      console.log('setItem => loading', this.scene.children)
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
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const scene = Object.assign({}, this.scene)
        const column = scene.children.filter((p) => p.type === columnType)[0]
        const itemIndex = scene.children.indexOf(column)
        const newColumn = Object.assign({}, column)

        console.log('itemIndex', dropResult)
        console.log('newColumn', newColumn)
        // check if element was ADDED in current column
        // if (dropResult.removedIndex == null && dropResult.addedIndex >= 0) {
        //   // your action / api call
        //   dropResult.payload.loading = true
        //   console.log('<<<===',dropResult,dropResult.payload.loading)
        //   // simulate api call
        //   setTimeout(function () {
        //     dropResult.payload.loading = false
        //     console.log('===>>>',dropResult,dropResult.payload.loading)
        //   }, 1000)
        // }

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

    animation() {
      $(function () {
        $('#sun_yellow').animate(
          { top: '96%', opacity: 0.4 },
          12000,
          function () {
            $('#stars').animate({ opacity: 1 }, 5000, function () {
              $('#moon').animate({ top: '30%', opacity: 1 }, 5000, function () {
                $('#sstar').animate({ opacity: 1 }, 300)
                $('#sstar').animate(
                  {
                    backgroundPosition: '0px 0px',
                    top: '15%',
                    opacity: 0,
                  },
                  500,
                  function () { },
                )
              })
            })
          },
        )
        $('#sun_red').animate({ top: '96%', opacity: 0.8 }, 12000)
        $('#sky').animate({ backgroundColor: '#4F0030' }, 18000)
        $('#clouds').animate(
          { backgroundPosition: '1000px 0px', opacity: 0 },
          30000,
        )
        $('#night').animate({ opacity: 0.8 }, 20000)
      })
    },
    meteor() {
      var WINDOW_WIDTH = document.body.offsetWidth
      var WINDOW_HEIGHT = document.body.offsetHeight
      var canvas, context
      var num = 300
      // var num = 500;
      var stars = []
      var mouseX = WINDOW_WIDTH / 2
      var mouseY = WINDOW_HEIGHT / 2
      var rnd

      window.onload = function () {
        console.log('=jiasjdaif')
        canvas = document.getElementById('canvas')
        canvas.width = WINDOW_WIDTH
        canvas.height = WINDOW_HEIGHT

        context = canvas.getContext('2d')

        addStar()
        setInterval(render, 33)
        liuxing()

        // render();
        document.body.addEventListener('mousemove', mouseMove)
      }

      function liuxing() {
        var time = Math.round(Math.random() * 3000 + 33)
        setTimeout(function () {
          rnd = Math.ceil(Math.random() * stars.length)
          liuxing()
        }, time)
      }

      function mouseMove(e) {
        //因为是整屏背景，这里不做坐标转换
        mouseX = e.clientX
        mouseY = e.clientY
      }

      function render() {
        context.fillStyle = 'rgba(0,0,0,0.1)'
        context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
        // context.clearRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT)
        for (var i = 0; i < num; i++) {
          var star = stars[i]
          if (i == rnd) {
            star.vx = -5
            star.vy = 20
            context.beginPath()
            context.strokeStyle = 'rgba(255,255,255,' + star.alpha + ')'
            context.lineWidth = star.r
            context.moveTo(star.x, star.y)
            context.lineTo(star.x + star.vx, star.y + star.vy)
            context.stroke()
            context.closePath()
          }
          star.alpha += star.ra
          if (star.alpha <= 0) {
            star.alpha = 0
            star.ra = -star.ra
            star.vx = Math.random() * 0.2 - 0.1
            star.vy = Math.random() * 0.2 - 0.1
          } else if (star.alpha > 1) {
            star.alpha = 1
            star.ra = -star.ra
          }
          star.x += star.vx
          if (star.x >= WINDOW_WIDTH) {
            star.x = 0
          } else if (star.x < 0) {
            star.x = WINDOW_WIDTH
            star.vx = Math.random() * 0.2 - 0.1
            star.vy = Math.random() * 0.2 - 0.1
          }
          star.y += star.vy
          if (star.y >= WINDOW_HEIGHT) {
            star.y = 0
            star.vy = Math.random() * 0.2 - 0.1
            star.vx = Math.random() * 0.2 - 0.1
          } else if (star.y < 0) {
            star.y = WINDOW_HEIGHT
          }
          context.beginPath()
          var bg = context.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.r,
          )
          bg.addColorStop(0, 'rgba(255,255,255,' + star.alpha + ')')
          bg.addColorStop(1, 'rgba(255,255,255,0)')
          context.fillStyle = bg
          context.arc(star.x, star.y, star.r, 0, Math.PI * 2, true)
          context.fill()
          context.closePath()
        }
      }

      function addStar() {
        for (var i = 0; i < num; i++) {
          var aStar = {
            x: Math.round(Math.random() * WINDOW_WIDTH),
            y: Math.round(Math.random() * WINDOW_HEIGHT),
            r: Math.random() * 3,
            ra: Math.random() * 0.05,
            alpha: Math.random(),
            vx: Math.random() * 0.2 - 0.1,
            vy: Math.random() * 0.2 - 0.1,
          }
          stars.push(aStar)
        }
      }
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

.dragg-wrapper-bg {
  background: #a855f736;
}

// .ml20{
//   margin-left: 20px;
// }
</style>
