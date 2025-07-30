const tasksList = document.querySelector('.tasks__list');
const form = document.querySelector('.main__form');
const input = document.querySelector('.main__form-input');
const taskCounterTitle = document.querySelector('.tasks__list-title');
const completedTaskCounter = document.querySelector('.tasks__list-counter');
const filters = document.querySelector('.tasks__list-filter');

let tasksArr = [];
let filterState = 'All';

filters.disabled = true
loadTasksFromStorage();

form.addEventListener('submit', handleFormSubmit);
tasksList.addEventListener('click', handleTrashClick);
tasksList.addEventListener('click', handleIsCheckedClick);
filters.addEventListener('change', handleFiltersChange);

function handleFiltersChange (event) {
    filterState = event.target.value;
    renderFilteredTasks(filterState);
}

function handleFormSubmit(event) {
    event.preventDefault();

    const description = input.value.trim();
    if (!description) {
        alert('Введите корректную задачу')
        return
    };

    if (description.length > 1000) {
        alert('Слишком много символов')
        return
    };


    const task = createTask(description);

    tasksArr = [...tasksArr, task];
    updateUI();
    saveTasksToStorage();

    input.value = '';
    filters.disabled = tasksArr.length === 0;
}

function handleTrashClick(event) {
    const trashIcon = event.target.closest('.task__trash');
    if (!trashIcon) return;

    const taskElement = trashIcon.closest('.task');
    const taskId = parseInt(taskElement.dataset.id);

    tasksArr = tasksArr.filter(task => task.id !== taskId);
    updateUI();
    saveTasksToStorage();
    resetFilters();
    filters.disabled = tasksArr.length === 0;
}

function handleIsCheckedClick (event) {
    if (event.target.tagName !== 'INPUT') return;

    const taskElement = event.target.closest('.task');
    const id = parseInt(taskElement.dataset.id);

    const index = tasksArr.findIndex(elem => elem.id === id);
    tasksArr[index].isCompleted = !tasksArr[index].isCompleted;
    saveTasksToStorage();

    toggleCompletedClass(taskElement);
    rerenderCompleteCounter(tasksArr);
    renderFilteredTasks(filterState);
}

function resetFilters() {
    filterState = 'All'
    filters.value = 'All';
    renderFilteredTasks(filterState);
}

function renderFilteredTasks(value) {
    let filteredTasks = tasksArr;

    if (value === 'Completed') {
        filteredTasks = tasksArr.filter(task => task.isCompleted);
    } else if (value === 'Not Completed') {
        filteredTasks = tasksArr.filter(task => !task.isCompleted);
    }

    renderTasks(filteredTasks);
}

function createTask(description) {
    return {
        description,
        id: Date.now() - Math.floor(Math.random() * 100000),
        isCompleted: false
    };
}

function rerenderCounter (tasks) {
    taskCounterTitle.firstElementChild.textContent = tasks.length
}

function rerenderCompleteCounter (tasks) {
    const completeTasks = tasks.filter(elem => elem.isCompleted === true).length
    completedTaskCounter.firstElementChild.textContent = `${completeTasks}/${tasks.length}`
}


function renderTasks(tasks) {
    tasksList.innerHTML = tasks.map(renderTask).join('');
}

function renderTask({ id, description, isCompleted}) {

    return `
        <div class="task ${isCompleted ? 'completed' : ''}" data-id="${id}">
            <input type="checkbox" class="task__checkbox" id="isComplete-${id}" ${isCompleted ? 'checked' : ''}>
            <div class="task__description">${description}</div>
            <div class="task__trash">
                <img src="assets/icons/trash.png" alt="trash">
            </div>
        </div>
    `;
}

function updateUI () {
    renderTasks(tasksArr);
    toggleEmptyClass(tasksArr);
    rerenderCounter(tasksArr);
    rerenderCompleteCounter(tasksArr);
    resetFilters();
}

function toggleCompletedClass (taskElement) {
    taskElement.classList.toggle('completed')
}

function toggleEmptyClass(tasks) {
    tasksList.classList.toggle('empty', tasks.length === 0);
}

function saveTasksToStorage (tasks = tasksArr) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if(!savedTasks) return;
    try{
        tasksArr = JSON.parse(savedTasks);
    } catch(e) {
        console.error('Ошибка localStorage', e);
        tasksArr = [];
        return;
    }

    renderFilteredTasks(filterState);
    toggleEmptyClass(tasksArr);
    rerenderCounter(tasksArr);
    rerenderCompleteCounter(tasksArr);
    filters.disabled = tasksArr.length === 0;
}
