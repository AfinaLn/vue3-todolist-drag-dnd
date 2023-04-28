<template>
  <div>
    <h1>Todo List</h1>
    <form @submit.prevent="addTodo">
      <label for="new-todo">New Todo:</label>
      <input id="new-todo" type="text" v-model="newTodo" required>
      <button type="submit">Add</button>
    </form>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
        <span v-if="todo.reminder"> (Reminder: {{ todo.reminder.toLocaleString() }})</span>
        <button @click="deleteTodo(todo)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, reactive, watchEffect } from 'vue';

export default {
  setup() {
    const newTodo = ref('');
    const todos = reactive([]);
    const reminder = ref(null);
    const repeat = reactive({
      startDate: null,
      endDate: null,
      interval: null
    });

    const addTodo = () => {
      if (newTodo.value.trim() === '') return;

      const todo = {
        id: Date.now(),
        text: newTodo.value.trim(),
        reminder: reminder.value ? new Date(reminder.value) : null,
        repeat: repeat.startDate && repeat.endDate && repeat.interval ? repeat : null
      };

      todos.push(todo);
      newTodo.value = '';
      reminder.value = null;
      repeat.startDate = null;
      repeat.endDate = null;
      repeat.interval = null;
    };

    const deleteTodo = (todo) => {
      todos.splice(todos.indexOf(todo), 1);
    };

    const checkReminders = () => {
      console.log(JSON.parse(JSON.stringify(todos)))
      todos.forEach(todo => {
        if (todo.reminder && todo.reminder <= new Date()) {
          if (Notification.permission === 'granted') {
            new Notification(`${todo.text} - Reminder`);
          }
          todo.reminder = null;
        }
        if (todo.repeat) {
          const nextDate = new Date(todo.repeat.startDate.getTime() + todo.repeat.interval * 24 * 60 * 60 * 1000);
          if (nextDate <= todo.repeat.endDate) {
            todos.push({
              id: Date.now(),
              text: todo.text,
              reminder: nextDate,
              repeat: todo.repeat
            });
            todo.repeat.startDate = nextDate;
          } else {
            todo.repeat = null;
          }
        }
      });
    };

    watchEffect(() => {
      const timer = setInterval(checkReminders, 1000);
      return () => clearInterval(timer);
    });

    return {
      newTodo,
      todos,
      reminder,
      repeat,
      addTodo,
      deleteTodo
    };
  }
};
</script>
