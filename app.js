/* ============================================================
   LearnJS — Interactive JavaScript Learning Platform
   Main Application Logic (Expanded for Beginners)
   ============================================================ */

// ─── State ───────────────────────────────────────────────────
const state = {
    currentSection: 'basics',
    completedSections: new Set(),
    domCounter: 0,
    domItemCount: 2,
    quizAnswers: {},
    quizSubmitted: false,
};

// Default code for each editor (used for reset)
const defaultCode = {};

// ─── Loading Screen ──────────────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1600);
});

// ─── Initialize ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTheme();
    initMobileSidebar();
    initEditorDefaults();
    renderExercises();
    renderQuiz();
    loadProgress();
    initEditorTabKey();
});

// ─── Navigation ──────────────────────────────────────────────
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
            closeMobileSidebar();
        });
    });
}

function switchSection(sectionId) {
    // Mark previous section as completed
    if (state.currentSection && state.currentSection !== sectionId) {
        markComplete(state.currentSection);
    }

    // Hide all sections
    document.querySelectorAll('.topic-section').forEach(s => {
        s.style.display = 'none';
    });

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        // Reset animation
        target.style.animation = 'none';
        target.offsetHeight; // Trigger reflow
        target.style.animation = '';
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) navItem.classList.add('active');

    state.currentSection = sectionId;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Progress Tracking ──────────────────────────────────────
function markComplete(sectionId) {
    state.completedSections.add(sectionId);
    const check = document.getElementById(`check-${sectionId}`);
    if (check) check.classList.add('visible');
    updateProgress();
    saveProgress();
}

function updateProgress() {
    const totalSections = 11; // basics, arrays, controlflow, functions, oop, promises, async, errorhandling, dom, practice, quiz
    const completed = state.completedSections.size;
    const pct = Math.round((completed / totalSections) * 100);
    document.getElementById('progressPct').textContent = `${pct}%`;
    document.getElementById('progressFill').style.width = `${pct}%`;
}

function saveProgress() {
    try {
        localStorage.setItem('learnjs-progress', JSON.stringify([...state.completedSections]));
    } catch (e) { /* silent */ }
}

function loadProgress() {
    try {
        const saved = localStorage.getItem('learnjs-progress');
        if (saved) {
            const arr = JSON.parse(saved);
            arr.forEach(s => {
                state.completedSections.add(s);
                const check = document.getElementById(`check-${s}`);
                if (check) check.classList.add('visible');
            });
            updateProgress();
        }
    } catch (e) { /* silent */ }
}

// ─── Theme Toggle ────────────────────────────────────────────
function initTheme() {
    const savedTheme = localStorage.getItem('learnjs-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('themeToggleMobile').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('learnjs-theme', next);
    showToast(`${next === 'dark' ? '🌙' : '☀️'} ${next.charAt(0).toUpperCase() + next.slice(1)} mode activated`, 'info');
}

// ─── Mobile Sidebar ──────────────────────────────────────────
function initMobileSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('sidebarOverlay');

    hamburger.addEventListener('click', () => {
        toggleMobileSidebar();
    });

    overlay.addEventListener('click', () => {
        closeMobileSidebar();
    });
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');

    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
}

// ─── Editor Defaults ─────────────────────────────────────────
function initEditorDefaults() {
    document.querySelectorAll('.code-editor').forEach(editor => {
        const id = editor.id.replace('editor-', '');
        defaultCode[id] = editor.value;
    });
}

function initEditorTabKey() {
    document.querySelectorAll('.code-editor, .exercise-editor').forEach(textarea => {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }
        });
    });
}

// ─── Code Execution ──────────────────────────────────────────
function runCode(sectionId) {
    const editor = document.getElementById(`editor-${sectionId}`);
    const output = document.getElementById(`output-${sectionId}`);
    if (!editor || !output) return;

    const code = editor.value;
    output.innerHTML = '<span style="color:#6c7086;">⏳ Running...</span>';

    setTimeout(() => {
        output.innerHTML = '';
        executeCode(code, output, sectionId);
    }, 150);
}

function executeCode(code, outputEl, sectionId) {
    const logs = [];

    // Save original console methods
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        table: console.table,
    };

    const formatValue = (val) => {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';
        if (typeof val === 'object') {
            try { return JSON.stringify(val, null, 2); }
            catch { return String(val); }
        }
        return String(val);
    };

    // Override console to capture output
    console.log = (...args) => {
        logs.push({ type: 'log', text: args.map(formatValue).join(' ') });
    };
    console.error = (...args) => {
        logs.push({ type: 'error', text: args.map(formatValue).join(' ') });
    };
    console.warn = (...args) => {
        logs.push({ type: 'warn', text: args.map(formatValue).join(' ') });
    };
    console.info = (...args) => {
        logs.push({ type: 'log', text: args.map(formatValue).join(' ') });
    };
    console.table = (data) => {
        logs.push({ type: 'log', text: formatValue(data) });
    };

    try {
        // Wrap code in async IIFE.
        // IMPORTANT: Add \n before closing brace so trailing // comments don't break the wrapper.
        // Use Function constructor to create a fresh scope (avoids let/const re-declaration errors).
        const wrappedCode = `return (async () => {
${code}
})()`;
        const fn = new Function(wrappedCode);
        const result = fn();

        // Handle async results (promises from async/await, setTimeout, fetch, etc.)
        if (result && typeof result.then === 'function') {
            // Show immediate synchronous logs first
            renderLogs(logs, outputEl);

            result.then(() => {
                // After promise resolves, re-render with any additional logs from async callbacks
                setTimeout(() => {
                    renderLogs(logs, outputEl);
                    restoreConsole(originalConsole);
                }, 500);
            }).catch((err) => {
                logs.push({ type: 'error', text: `❌ ${err.message || err}` });
                renderLogs(logs, outputEl);
                restoreConsole(originalConsole);
            });

            // Final safety net: if the promise takes too long, still show whatever we have
            setTimeout(() => {
                renderLogs(logs, outputEl);
                restoreConsole(originalConsole);
            }, 5000);
        } else {
            renderLogs(logs, outputEl);
            restoreConsole(originalConsole);
        }
    } catch (err) {
        logs.push({ type: 'error', text: `❌ ${err.message}` });
        renderLogs(logs, outputEl);
        restoreConsole(originalConsole);
        showToast('Error in your code — check the output', 'error');
    }
}

function restoreConsole(original) {
    console.log = original.log;
    console.error = original.error;
    console.warn = original.warn;
    console.info = original.info;
    console.table = original.table;
}

function renderLogs(logs, outputEl) {
    if (logs.length === 0) {
        outputEl.innerHTML = '<span style="color:#6c7086;">No output. Use console.log() to see results.</span>';
        return;
    }

    outputEl.innerHTML = logs.map(log => {
        const cls = log.type === 'error' ? 'error-line' : log.type === 'warn' ? 'warn-line' : 'log-line';
        return `<span class="${cls}">${escapeHtml(log.text)}</span>`;
    }).join('\n');

    showToast('✅ Code executed successfully!', 'success');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function resetEditor(sectionId) {
    const editor = document.getElementById(`editor-${sectionId}`);
    if (editor && defaultCode[sectionId]) {
        editor.value = defaultCode[sectionId];
        clearOutput(sectionId);
        showToast('↺ Editor reset to default', 'info');
    }
}

function clearOutput(sectionId) {
    const output = document.getElementById(`output-${sectionId}`);
    if (output) output.innerHTML = '';
}

// ─── Toast Notifications ─────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ─── DOM Playground ──────────────────────────────────────────
const randomTexts = [
    "I've been changed! 🎉",
    "Hello from JS! 🚀",
    "DOM is awesome! ✨",
    "Dynamic content! 💫",
    "JavaScript rocks! 🎸",
    "Updated by code! 🔥",
];

const randomColors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
    'linear-gradient(135deg, #f6d365, #fda085)',
];

function domChangeText() {
    const text = document.getElementById('domTargetText');
    const randText = randomTexts[Math.floor(Math.random() * randomTexts.length)];
    text.textContent = randText;
    triggerDomAnim('domTargetBox');
}

function domChangeColor() {
    const box = document.getElementById('domTargetBox');
    const randColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    box.style.background = randColor;
    triggerDomAnim('domTargetBox');
}

function domToggleSize() {
    const box = document.getElementById('domTargetBox');
    box.classList.toggle('big');
    triggerDomAnim('domTargetBox');
}

function domAddItem() {
    const list = document.getElementById('domList');
    state.domItemCount++;
    const li = document.createElement('li');
    li.textContent = `Item ${state.domItemCount}`;
    li.style.color = randomColors.length > 0 ? '#6366f1' : '';
    list.appendChild(li);
    triggerDomAnim('domListContainer');
    showToast(`➕ Added Item ${state.domItemCount}`, 'success');
}

function domRemoveItem() {
    const list = document.getElementById('domList');
    if (list.children.length > 0) {
        list.removeChild(list.lastElementChild);
        triggerDomAnim('domListContainer');
        showToast('➖ Removed last item', 'info');
    } else {
        showToast('List is empty!', 'error');
    }
}

function domIncrement() {
    state.domCounter++;
    const counterVal = document.getElementById('counterValue');
    counterVal.textContent = state.domCounter;
    triggerDomAnim('domCounter');
}

function domAnimate() {
    const box = document.getElementById('domTargetBox');
    box.style.transition = 'all 0.5s ease';
    box.style.transform = 'rotate(360deg) scale(1.1)';
    setTimeout(() => {
        box.style.transform = 'rotate(0deg) scale(1)';
    }, 600);
}

function domReset() {
    document.getElementById('domTargetText').textContent = "Hello! I'm a DOM element 👋";
    const box = document.getElementById('domTargetBox');
    box.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    box.classList.remove('big');
    box.style.transform = '';

    const list = document.getElementById('domList');
    list.innerHTML = '<li>Item 1</li><li>Item 2</li>';
    state.domItemCount = 2;

    state.domCounter = 0;
    document.getElementById('counterValue').textContent = '0';
    document.getElementById('counterValue').style.color = '';
    document.getElementById('counterValue').style.fontSize = '';

    showToast('↺ DOM playground reset', 'info');
}

function triggerDomAnim(elementId) {
    const el = document.getElementById(elementId);
    el.classList.remove('dom-animate');
    el.offsetHeight;
    el.classList.add('dom-animate');
}

// ─── Practice Exercises (Expanded) ───────────────────────────
const exercises = [
    {
        id: 'ex1',
        title: 'Reverse a String',
        difficulty: 'easy',
        description: 'Write a function called <code>reverseString</code> that takes a string and returns it reversed. <em>Hint: strings can be split into arrays!</em>',
        expected: 'olleH',
        starter: `function reverseString(str) {\n  // Your code here\n  // Hint: try .split(""), .reverse(), .join("")\n}\n\nconsole.log(reverseString("Hello"));`,
        test: (output) => output.trim() === 'olleH',
    },
    {
        id: 'ex2',
        title: 'Find the Maximum',
        difficulty: 'easy',
        description: 'Write a function <code>findMax</code> that takes an array of numbers and returns the largest number. <em>Hint: try Math.max() with the spread operator!</em>',
        expected: '99',
        starter: `function findMax(arr) {\n  // Your code here\n  // Hint: Math.max(...arr) or use a loop\n}\n\nconsole.log(findMax([10, 5, 99, 42, 7]));`,
        test: (output) => output.trim() === '99',
    },
    {
        id: 'ex3',
        title: 'Count Vowels',
        difficulty: 'easy',
        description: 'Write a function <code>countVowels</code> that counts the number of vowels (a, e, i, o, u) in a given string. Case-insensitive!',
        expected: '3',
        starter: `function countVowels(str) {\n  // Your code here\n  // Hint: convert to lowercase, then check each character\n}\n\nconsole.log(countVowels("Hello World"));`,
        test: (output) => output.trim() === '3',
    },
    {
        id: 'ex4',
        title: 'Sum of Array',
        difficulty: 'easy',
        description: 'Use the <code>reduce</code> method to calculate the sum of all numbers in an array. <em>reduce() takes a callback with (accumulator, currentValue) and an initial value.</em>',
        expected: '150',
        starter: `const numbers = [10, 20, 30, 40, 50];\n\n// Use .reduce() to find the sum\nconst sum = numbers.reduce((total, num) => {\n  // Your code here\n}, 0);\n\nconsole.log(sum);`,
        test: (output) => output.trim() === '150',
    },
    {
        id: 'ex5',
        title: 'FizzBuzz',
        difficulty: 'medium',
        description: 'Write code that prints numbers from 1 to 15. For multiples of 3, print "Fizz". For multiples of 5, print "Buzz". For multiples of both 3 AND 5, print "FizzBuzz".',
        expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
        starter: `// FizzBuzz: print 1 to 15\nfor (let i = 1; i <= 15; i++) {\n  // Check multiples of BOTH 3 and 5 first!\n  // Then check 3, then 5, then just print i\n}`,
        test: (output) => {
            const expected = '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz';
            return output.trim() === expected;
        },
    },
    {
        id: 'ex6',
        title: 'Remove Duplicates',
        difficulty: 'medium',
        description: 'Write a function <code>removeDuplicates</code> that takes an array and returns a new array with duplicates removed. <em>Hint: try using a Set!</em>',
        expected: '1,2,3,4,5',
        starter: `function removeDuplicates(arr) {\n  // Your code here\n  // Hint: new Set(arr) removes duplicates,\n  // then spread back into an array\n}\n\nconsole.log(removeDuplicates([1, 2, 2, 3, 4, 4, 5]).join(","));`,
        test: (output) => output.trim() === '1,2,3,4,5',
    },
    {
        id: 'ex7',
        title: 'Capitalize Words',
        difficulty: 'medium',
        description: 'Write a function <code>capitalizeWords</code> that capitalizes the first letter of each word in a string.',
        expected: 'Hello World From JavaScript',
        starter: `function capitalizeWords(str) {\n  // Your code here\n  // Hint: split by " ", map each word,\n  // capitalize first char + rest of word\n}\n\nconsole.log(capitalizeWords("hello world from javascript"));`,
        test: (output) => output.trim() === 'Hello World From JavaScript',
    },
    {
        id: 'ex8',
        title: 'Create a Class',
        difficulty: 'hard',
        description: 'Create a <code>Rectangle</code> class with <code>width</code> and <code>height</code> properties. Add an <code>area()</code> method and a <code>perimeter()</code> method. Create an instance with width 5 and height 10, then print the area and perimeter.',
        expected: 'Area: 50\nPerimeter: 30',
        starter: `class Rectangle {\n  // constructor(width, height)\n  // area() method\n  // perimeter() method\n}\n\nconst rect = new Rectangle(5, 10);\nconsole.log("Area:", rect.area());\nconsole.log("Perimeter:", rect.perimeter());`,
        test: (output) => {
            const lines = output.trim().split('\n');
            return lines.length >= 2 && lines[0].includes('50') && lines[1].includes('30');
        },
    },
    {
        id: 'ex9',
        title: 'Flatten an Array',
        difficulty: 'hard',
        description: 'Write a function <code>flatten</code> that takes a nested array and returns a flat (one-dimensional) array. <em>Hint: use .flat(Infinity) or recursion!</em>',
        expected: '1,2,3,4,5,6',
        starter: `function flatten(arr) {\n  // Your code here\n  // Hint: arr.flat(Infinity) works, but\n  // try doing it with recursion for practice!\n}\n\nconsole.log(flatten([1, [2, 3], [4, [5, 6]]]).join(","));`,
        test: (output) => output.trim() === '1,2,3,4,5,6',
    },
    {
        id: 'ex10',
        title: 'Promise Chain',
        difficulty: 'hard',
        description: 'Create an async function <code>fetchAndProcess</code> that fetches data from the URL below, gets the first 3 users, and prints their names.',
        expected: '',
        starter: `async function fetchAndProcess() {\n  // Fetch from: "https://jsonplaceholder.typicode.com/users"\n  // Get first 3 users\n  // Print each user's name\n}\n\nawait fetchAndProcess();`,
        test: (output) => output.trim().split('\n').length >= 3,
    },
];

function renderExercises() {
    const container = document.getElementById('exercisesContainer');
    if (!container) return;

    container.innerHTML = exercises.map((ex, i) => `
        <div class="exercise-card" style="animation-delay: ${i * 0.1}s">
            <div class="exercise-header">
                <span class="exercise-number">${i + 1}</span>
                <span class="exercise-title">${ex.title}</span>
                <span class="exercise-difficulty difficulty-${ex.difficulty}">${ex.difficulty}</span>
            </div>
            <p class="exercise-description">${ex.description}</p>
            ${ex.expected ? `<div class="expected-output">
                <div class="expected-output-label">✅ Expected Output</div>
                <pre>${escapeHtml(ex.expected)}</pre>
            </div>` : ''}
            <div class="exercise-editor-wrap">
                <textarea class="exercise-editor" id="exercise-editor-${ex.id}" spellcheck="false">${ex.starter}</textarea>
                <div class="exercise-actions">
                    <button class="btn-run" onclick="runExercise('${ex.id}')">▶ Run</button>
                    <button class="btn-reset" onclick="resetExercise('${ex.id}')">↺ Reset</button>
                </div>
                <pre class="exercise-output" id="exercise-output-${ex.id}"></pre>
                <div class="exercise-result-badge" id="exercise-result-${ex.id}"></div>
            </div>
        </div>
    `).join('');

    // Store defaults for exercise editors
    exercises.forEach(ex => {
        defaultCode[`exercise-${ex.id}`] = ex.starter;
    });

    // Re-init tab key for new textareas
    setTimeout(initEditorTabKey, 100);
}

function runExercise(exId) {
    const editor = document.getElementById(`exercise-editor-${exId}`);
    const outputEl = document.getElementById(`exercise-output-${exId}`);
    const resultEl = document.getElementById(`exercise-result-${exId}`);
    if (!editor || !outputEl) return;

    const code = editor.value;
    const exercise = exercises.find(e => e.id === exId);
    if (!exercise) return;

    const logs = [];
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;

    console.log = (...args) => {
        logs.push(args.map(a => {
            if (typeof a === 'object') {
                try { return JSON.stringify(a); } catch { return String(a); }
            }
            return String(a);
        }).join(' '));
    };
    console.error = (...args) => {
        logs.push(args.map(String).join(' '));
    };
    console.warn = (...args) => {
        logs.push(args.map(String).join(' '));
    };

    try {
        // Use async IIFE wrapper to support await in exercises
        const wrappedCode = `return (async () => {
${code}
})()`;
        const fn = new Function(wrappedCode);
        const result = fn();
        
        if (result && typeof result.then === 'function') {
            outputEl.textContent = '⏳ Running async code...';
            result.then(() => {
                setTimeout(() => {
                    const outputText = logs.join('\n');
                    outputEl.textContent = outputText || '(no output)';
                    const passed = exercise.test(outputText);
                    resultEl.className = 'exercise-result-badge ' + (passed ? 'pass' : 'fail');
                    resultEl.textContent = passed ? '✅ Correct! Well done!' : '❌ Not quite right — try again!';
                    resultEl.style.display = 'flex';
                    if (passed) showToast(`🎉 Exercise "${exercise.title}" passed!`, 'success');
                    console.log = origLog;
                    console.error = origError;
                    console.warn = origWarn;
                }, 500);
            }).catch((err) => {
                outputEl.innerHTML = `<span class="error-line">❌ ${escapeHtml(err.message)}</span>`;
                resultEl.className = 'exercise-result-badge fail';
                resultEl.textContent = '❌ Error in your code';
                resultEl.style.display = 'flex';
                console.log = origLog;
                console.error = origError;
                console.warn = origWarn;
            });
        } else {
            const outputText = logs.join('\n');
            outputEl.textContent = outputText || '(no output)';
            const passed = exercise.test(outputText);
            resultEl.className = 'exercise-result-badge ' + (passed ? 'pass' : 'fail');
            resultEl.textContent = passed ? '✅ Correct! Well done!' : '❌ Not quite right — try again!';
            resultEl.style.display = 'flex';
            if (passed) showToast(`🎉 Exercise "${exercise.title}" passed!`, 'success');
            console.log = origLog;
            console.error = origError;
            console.warn = origWarn;
        }
    } catch (err) {
        outputEl.innerHTML = `<span class="error-line">❌ ${escapeHtml(err.message)}</span>`;
        resultEl.className = 'exercise-result-badge fail';
        resultEl.textContent = '❌ Error in your code';
        resultEl.style.display = 'flex';
        console.log = origLog;
        console.error = origError;
        console.warn = origWarn;
    }
}

function resetExercise(exId) {
    const exercise = exercises.find(e => e.id === exId);
    const editor = document.getElementById(`exercise-editor-${exId}`);
    const outputEl = document.getElementById(`exercise-output-${exId}`);
    const resultEl = document.getElementById(`exercise-result-${exId}`);

    if (editor && exercise) {
        editor.value = exercise.starter;
    }
    if (outputEl) outputEl.textContent = '';
    if (resultEl) {
        resultEl.className = 'exercise-result-badge';
        resultEl.style.display = 'none';
    }
}

// ─── Quiz (Expanded to 15 questions) ─────────────────────────
const quizQuestions = [
    {
        q: 'Which keyword declares a block-scoped, reassignable variable?',
        options: ['var', 'let', 'const', 'function'],
        answer: 1,
    },
    {
        q: 'What does `typeof null` return in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        answer: 2,
    },
    {
        q: 'Which array method creates a new array by applying a function to each element?',
        options: ['forEach()', 'filter()', 'map()', 'reduce()'],
        answer: 2,
    },
    {
        q: 'What is the output of: `console.log(0.1 + 0.2 === 0.3)`?',
        options: ['true', 'false', 'undefined', 'NaN'],
        answer: 1,
    },
    {
        q: 'Arrow functions have their own `this` binding.',
        options: ['True', 'False'],
        answer: 1,
    },
    {
        q: 'Which Promise method waits for ALL promises to resolve?',
        options: ['Promise.race()', 'Promise.all()', 'Promise.any()', 'Promise.resolve()'],
        answer: 1,
    },
    {
        q: 'What does the `await` keyword do?',
        options: [
            'Creates a new Promise',
            'Catches errors',
            'Pauses execution until a Promise settles',
            'Runs code in parallel'
        ],
        answer: 2,
    },
    {
        q: 'Which method selects the first element matching a CSS selector?',
        options: ['getElementById()', 'querySelector()', 'getElementsByClassName()', 'querySelectorAll()'],
        answer: 1,
    },
    {
        q: 'What is the purpose of `super()` in a class constructor?',
        options: [
            'Creates a new instance',
            'Calls the parent class constructor',
            'Makes a method static',
            'Defines a private field'
        ],
        answer: 1,
    },
    {
        q: 'Which of these is NOT a valid JavaScript data type?',
        options: ['Symbol', 'BigInt', 'Float', 'undefined'],
        answer: 2,
    },
    {
        q: 'What does `const` prevent you from doing?',
        options: [
            'Changing properties of an object',
            'Reassigning the variable to a new value',
            'Using the variable in a loop',
            'Passing the variable to a function'
        ],
        answer: 1,
    },
    {
        q: 'What is a closure in JavaScript?',
        options: [
            'A way to close the browser',
            'A function that remembers variables from its outer scope',
            'A method to end a loop',
            'A way to close a database connection'
        ],
        answer: 1,
    },
    {
        q: 'Which operator should you use for strict equality comparison?',
        options: ['=', '==', '===', '!='],
        answer: 2,
    },
    {
        q: 'What does `[...arr]` do?',
        options: [
            'Deletes the array',
            'Creates a shallow copy of the array',
            'Reverses the array',
            'Sorts the array'
        ],
        answer: 1,
    },
    {
        q: 'Which block always runs regardless of whether an error occurred?',
        options: ['try', 'catch', 'finally', 'throw'],
        answer: 2,
    },
];

function renderQuiz() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    container.innerHTML = quizQuestions.map((q, i) => `
        <div class="quiz-question" style="animation-delay: ${i * 0.05}s">
            <div class="quiz-q-header">
                <span class="quiz-q-number">${i + 1}</span>
                <span class="quiz-q-text">${q.q}</span>
            </div>
            <div class="quiz-options" id="quiz-options-${i}">
                ${q.options.map((opt, j) => `
                    <div class="quiz-option" data-question="${i}" data-option="${j}" onclick="selectQuizOption(${i}, ${j})">
                        <span class="quiz-option-radio"></span>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <div class="quiz-submit-area">
            <button class="btn-submit-quiz" id="btnSubmitQuiz" onclick="submitQuiz()">Submit Quiz</button>
        </div>
    `;
}

function selectQuizOption(qIndex, optIndex) {
    if (state.quizSubmitted) return;

    // Deselect all in this question
    const optionsContainer = document.getElementById(`quiz-options-${qIndex}`);
    optionsContainer.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));

    // Select clicked
    const selected = optionsContainer.querySelector(`[data-option="${optIndex}"]`);
    selected.classList.add('selected');

    state.quizAnswers[qIndex] = optIndex;
}

function submitQuiz() {
    if (state.quizSubmitted) return;

    const totalQuestions = quizQuestions.length;
    const answeredCount = Object.keys(state.quizAnswers).length;

    if (answeredCount < totalQuestions) {
        showToast(`Please answer all ${totalQuestions} questions! (${answeredCount}/${totalQuestions} done)`, 'error');
        return;
    }

    state.quizSubmitted = true;
    let score = 0;

    quizQuestions.forEach((q, i) => {
        const userAnswer = state.quizAnswers[i];
        const optionsContainer = document.getElementById(`quiz-options-${i}`);
        const options = optionsContainer.querySelectorAll('.quiz-option');

        options.forEach(o => {
            o.style.cursor = 'default';
        });

        if (userAnswer === q.answer) {
            score++;
            options[userAnswer].classList.add('correct');
        } else {
            options[userAnswer].classList.add('incorrect');
            options[q.answer].classList.add('correct');
        }
    });

    // Show results
    document.getElementById('quizContainer').style.display = 'none';
    const results = document.getElementById('quizResults');
    results.style.display = 'block';

    document.getElementById('scoreNumber').textContent = score;
    document.getElementById('scoreLabelDenom').textContent = `/ ${totalQuestions}`;

    let msg = '';
    let detail = '';
    if (score === totalQuestions) {
        msg = '🎉 Perfect Score!';
        detail = 'You\'re a JavaScript master! Outstanding work!';
    } else if (score >= totalQuestions * 0.8) {
        msg = '🌟 Excellent!';
        detail = 'Almost perfect! You have a strong grasp of JavaScript.';
    } else if (score >= totalQuestions * 0.6) {
        msg = '👍 Good Job!';
        detail = 'You\'re on the right track. Review the concepts you missed.';
    } else if (score >= totalQuestions * 0.4) {
        msg = '📚 Keep Learning!';
        detail = 'Go through the modules again and practice more exercises.';
    } else {
        msg = '💪 Don\'t Give Up!';
        detail = 'Start from the basics and work your way up. You\'ve got this!';
    }

    document.getElementById('quizResultMsg').textContent = msg;
    document.getElementById('quizResultDetail').textContent = detail;

    // Update score circle color based on performance
    const circle = document.getElementById('scoreCircle');
    if (score >= totalQuestions * 0.8) {
        circle.style.borderColor = 'var(--accent-success)';
        document.getElementById('scoreNumber').style.color = 'var(--accent-success)';
    } else if (score >= totalQuestions * 0.5) {
        circle.style.borderColor = 'var(--accent-warning)';
        document.getElementById('scoreNumber').style.color = 'var(--accent-warning)';
    } else {
        circle.style.borderColor = 'var(--accent-danger)';
        document.getElementById('scoreNumber').style.color = 'var(--accent-danger)';
    }

    markComplete('quiz');
    showToast(`Quiz completed! Score: ${score}/${totalQuestions}`, score >= totalQuestions * 0.6 ? 'success' : 'info');
}

function resetQuiz() {
    state.quizAnswers = {};
    state.quizSubmitted = false;

    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';

    renderQuiz();
    showToast('🔄 Quiz reset — try again!', 'info');
}

// ─── INTERACTIVE DEMO ANIMATIONS ─────────────────────────────

// === 1. Variable Boxes Demo ===
const varData = {
    1: { values: ['"Alice"', '"Bob"', '"Charlie"', '"Diana"', '"Eve"'], types: ['String','String','String','String','String'], idx: 0, isConst: false },
    2: { values: ['25'], types: ['Number'], idx: 0, isConst: true },
    3: { values: ['true', 'false'], types: ['Boolean', 'Boolean'], idx: 0, isConst: false },
    4: { values: ['null', '0', '42', '100', '"done"'], types: ['null','Number','Number','Number','String'], idx: 0, isConst: false },
};

function animVarClick(boxId) {
    const data = varData[boxId];
    const box = document.getElementById(`varBox${boxId}`);
    const valEl = document.getElementById(`varVal${boxId}`);
    const typeEl = box.querySelector('.var-type');
    const log = document.getElementById('varDemoLog');

    if (data.isConst) {
        // Shake animation for const — can't change!
        box.classList.remove('shake');
        void box.offsetWidth; // Force reflow
        box.classList.add('shake');
        log.textContent = '🔒 const variables cannot be reassigned! TypeError: Assignment to constant variable.';
        log.style.background = 'var(--accent-danger-bg)';
        log.style.color = 'var(--accent-danger)';
        setTimeout(() => {
            log.style.background = '';
            log.style.color = '';
        }, 2000);
        return;
    }

    // Cycle to next value
    data.idx = (data.idx + 1) % data.values.length;
    const newVal = data.values[data.idx];
    const newType = data.types[data.idx];

    // Flash animation
    box.classList.remove('flash');
    void box.offsetWidth;
    box.classList.add('flash');

    // Animate value change
    valEl.style.transform = 'scale(0.5)';
    valEl.style.opacity = '0';
    setTimeout(() => {
        valEl.textContent = newVal;
        typeEl.textContent = newType;
        valEl.style.transform = 'scale(1)';
        valEl.style.opacity = '1';
    }, 150);

    const varNames = { 1: 'name', 2: 'age', 3: 'active', 4: 'score' };
    log.textContent = `✅ ${varNames[boxId]} = ${newVal}  →  Type: ${newType}`;
    log.style.background = 'var(--accent-success-bg)';
    log.style.color = 'var(--accent-success)';
    setTimeout(() => {
        log.style.background = '';
        log.style.color = '';
    }, 1500);
}

// === 2. Function Pipeline Demo ===
let funcAnimRunning = false;

function updateFuncInput() {
    const val = document.getElementById('funcInputNum').value || 5;
    document.getElementById('funcInputVal').textContent = val;
    document.getElementById('funcOutputVal').textContent = '?';
}

function runFuncPipeline() {
    if (funcAnimRunning) return;
    funcAnimRunning = true;

    const input = parseInt(document.getElementById('funcInputNum').value) || 5;
    const log = document.getElementById('funcDemoLog');

    // Reset all states
    ['funcInput', 'funcMachine1', 'funcMachine2', 'funcOutput'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    ['funcArrow1', 'funcArrow2', 'funcArrow3'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    document.getElementById('funcOutputVal').textContent = '?';
    document.getElementById('funcInputVal').textContent = input;

    // Step 1: Highlight input
    setTimeout(() => {
        document.getElementById('funcInput').classList.add('active');
        log.textContent = `📥 Input value: ${input}`;
    }, 200);

    // Step 2: Arrow 1 pulse
    setTimeout(() => {
        document.getElementById('funcArrow1').classList.add('active');
    }, 700);

    // Step 3: Function 1 processes
    setTimeout(() => {
        document.getElementById('funcMachine1').classList.add('active');
        const after1 = input * 2;
        log.textContent = `⚙️ double(${input}) → return ${input} * 2 = ${after1}`;
    }, 1000);

    // Step 4: Arrow 2 pulse
    setTimeout(() => {
        document.getElementById('funcArrow2').classList.add('active');
        document.getElementById('funcMachine1').classList.remove('active');
    }, 1800);

    // Step 5: Function 2 processes
    setTimeout(() => {
        document.getElementById('funcMachine2').classList.add('active');
        const after1 = input * 2;
        const after2 = after1 + 10;
        log.textContent = `⚙️ addTen(${after1}) → return ${after1} + 10 = ${after2}`;
    }, 2100);

    // Step 6: Arrow 3 + output
    setTimeout(() => {
        document.getElementById('funcArrow3').classList.add('active');
        document.getElementById('funcMachine2').classList.remove('active');
    }, 2900);

    // Step 7: Show final output
    setTimeout(() => {
        const result = (input * 2) + 10;
        document.getElementById('funcOutput').classList.add('active');
        const outputVal = document.getElementById('funcOutputVal');
        outputVal.textContent = result;
        outputVal.style.color = 'var(--accent-success)';

        log.textContent = `✅ Pipeline complete! ${input} → double → addTen → ${result}`;
        log.style.background = 'var(--accent-success-bg)';
        log.style.color = 'var(--accent-success)';

        setTimeout(() => {
            log.style.background = '';
            log.style.color = '';
            outputVal.style.color = '';
        }, 2000);

        funcAnimRunning = false;
    }, 3200);
}

function resetFuncPipeline() {
    funcAnimRunning = false;
    ['funcInput', 'funcMachine1', 'funcMachine2', 'funcOutput'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    ['funcArrow1', 'funcArrow2', 'funcArrow3'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    document.getElementById('funcOutputVal').textContent = '?';
    document.getElementById('funcOutputVal').style.color = '';
    document.getElementById('funcInputNum').value = 5;
    document.getElementById('funcInputVal').textContent = '5';
    document.getElementById('funcDemoLog').textContent = '👆 Click "Run Pipeline" to watch data flow through functions!';
    document.getElementById('funcDemoLog').style.background = '';
    document.getElementById('funcDemoLog').style.color = '';
}

// === 3. OOP Object Factory Demo ===
const oopAnimals = [
    { name: 'Rex', sound: 'Woof', emoji: '🐕' },
    { name: 'Whiskers', sound: 'Meow', emoji: '🐱' },
    { name: 'Tweety', sound: 'Tweet', emoji: '🐦' },
    { name: 'Ribbit', sound: 'Croak', emoji: '🐸' },
    { name: 'Simba', sound: 'Roar', emoji: '🦁' },
    { name: 'Nemo', sound: 'Blub', emoji: '🐠' },
    { name: 'Bambi', sound: 'Snort', emoji: '🦌' },
    { name: 'Polly', sound: 'Squawk', emoji: '🦜' },
];
let oopIndex = 0;
let oopCreatedCount = 0;

function createOOPObject() {
    const animal = oopAnimals[oopIndex % oopAnimals.length];
    oopIndex++;
    oopCreatedCount++;

    // Animate arrow
    const arrow = document.getElementById('oopArrow');
    arrow.classList.remove('active');
    void arrow.offsetWidth;
    arrow.classList.add('active');

    // Hide empty message
    const emptyMsg = document.getElementById('oopEmptyMsg');
    if (emptyMsg) emptyMsg.style.display = 'none';

    // Create object card
    const container = document.getElementById('oopObjects');
    const card = document.createElement('div');
    card.className = 'oop-object-card';
    card.innerHTML = `
        <div class="oop-obj-header">${animal.emoji} Object #${oopCreatedCount}</div>
        <div class="oop-obj-props">
            name: "${animal.name}"<br>
            sound: "${animal.sound}"
        </div>
        <div class="oop-obj-speak">→ speak(): "${animal.name} says ${animal.sound}!"</div>
    `;
    container.appendChild(card);

    // Keep max 4 visible
    const cards = container.querySelectorAll('.oop-object-card');
    if (cards.length > 4) {
        cards[0].remove();
    }

    const log = document.getElementById('oopDemoLog');
    log.textContent = `${animal.emoji} new Animal("${animal.name}", "${animal.sound}") → "${animal.name} says ${animal.sound}!"`;
    log.style.background = 'var(--accent-success-bg)';
    log.style.color = 'var(--accent-success)';
    setTimeout(() => {
        log.style.background = '';
        log.style.color = '';
    }, 1500);
}

// === 4. Promise Lifecycle Demo ===
let promiseSettled = false;

function animPromiseResolve() {
    if (promiseSettled) return;
    promiseSettled = true;

    // Transition pending → fulfilled
    const pending = document.getElementById('promiseNodePending');
    const fulfilled = document.getElementById('promiseNodeFulfilled');
    const connector = document.getElementById('promiseConnector1');
    const dataValue = document.getElementById('promiseDataValue');
    const dataBox = document.getElementById('promiseDataBox');
    const log = document.getElementById('promiseDemoLog');

    // Animate pending shrinking
    setTimeout(() => {
        pending.classList.remove('active');
        connector.classList.add('resolved');
    }, 300);

    // Animate fulfilled appearing
    setTimeout(() => {
        fulfilled.classList.add('active');
        dataValue.textContent = '✅ "Data loaded successfully!"';
        dataValue.style.color = 'var(--accent-success)';
        dataBox.style.borderColor = 'var(--accent-success)';

        log.textContent = '✅ Promise fulfilled! .then(result) is called with the resolved value.';
        log.style.background = 'var(--accent-success-bg)';
        log.style.color = 'var(--accent-success)';
    }, 800);
}

function animPromiseReject() {
    if (promiseSettled) return;
    promiseSettled = true;

    const pending = document.getElementById('promiseNodePending');
    const rejected = document.getElementById('promiseNodeRejected');
    const connector = document.getElementById('promiseConnector1');
    const dataValue = document.getElementById('promiseDataValue');
    const dataBox = document.getElementById('promiseDataBox');
    const log = document.getElementById('promiseDemoLog');

    setTimeout(() => {
        pending.classList.remove('active');
        connector.classList.add('rejected');
    }, 300);

    setTimeout(() => {
        rejected.classList.add('active');
        dataValue.textContent = '❌ Error: "Network request failed"';
        dataValue.style.color = 'var(--accent-danger)';
        dataBox.style.borderColor = 'var(--accent-danger)';

        log.textContent = '❌ Promise rejected! .catch(error) is called with the error.';
        log.style.background = 'var(--accent-danger-bg)';
        log.style.color = 'var(--accent-danger)';
    }, 800);
}

function animPromiseReset() {
    promiseSettled = false;

    document.getElementById('promiseNodePending').classList.add('active');
    document.getElementById('promiseNodeFulfilled').classList.remove('active');
    document.getElementById('promiseNodeRejected').classList.remove('active');

    const connector = document.getElementById('promiseConnector1');
    connector.classList.remove('resolved', 'rejected');

    const dataValue = document.getElementById('promiseDataValue');
    dataValue.textContent = '⏳ Waiting...';
    dataValue.style.color = '';

    const dataBox = document.getElementById('promiseDataBox');
    dataBox.style.borderColor = '';

    const log = document.getElementById('promiseDemoLog');
    log.textContent = '👆 Click Resolve or Reject to see the Promise lifecycle!';
    log.style.background = '';
    log.style.color = '';
}

// === 5. Async Timeline Demo ===
let asyncDemoRunning = false;

function runAsyncDemo() {
    if (asyncDemoRunning) return;
    asyncDemoRunning = true;

    const log = document.getElementById('asyncDemoLog');

    // Reset all steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`syncStep${i}`).className = 'async-step';
        document.getElementById(`asyncStep${i}`).className = 'async-step';
    }
    document.getElementById('syncTotal').innerHTML = 'Total: <strong>?</strong>';
    document.getElementById('asyncTotal').innerHTML = 'Total: <strong>?</strong>';

    log.textContent = '🏁 Starting both executions...';

    // ─── SYNCHRONOUS side (blocking) ───
    // Step 1: instant
    setTimeout(() => {
        document.getElementById('syncStep1').classList.add('running');
        log.textContent = '⬇️ Sync: Running console.log("Start")...';
    }, 300);

    setTimeout(() => {
        document.getElementById('syncStep1').classList.remove('running');
        document.getElementById('syncStep1').classList.add('done');
    }, 800);

    // Step 2: blocking heavy task 3s
    setTimeout(() => {
        document.getElementById('syncStep2').classList.add('running');
        document.getElementById('syncStep3').classList.add('blocked');
        log.textContent = '⬇️ Sync: heavyTask() is BLOCKING — Step 3 must wait!';
    }, 1000);

    setTimeout(() => {
        document.getElementById('syncStep2').classList.remove('running');
        document.getElementById('syncStep2').classList.add('done');
        document.getElementById('syncStep3').classList.remove('blocked');
    }, 4000);

    // Step 3: after blocking
    setTimeout(() => {
        document.getElementById('syncStep3').classList.add('running');
    }, 4200);

    setTimeout(() => {
        document.getElementById('syncStep3').classList.remove('running');
        document.getElementById('syncStep3').classList.add('done');
        document.getElementById('syncTotal').innerHTML = 'Total: <strong>~4s (sequential)</strong>';
    }, 4700);

    // ─── ASYNCHRONOUS side (non-blocking) ───
    // Step 1: instant
    setTimeout(() => {
        document.getElementById('asyncStep1').classList.add('running');
    }, 300);

    setTimeout(() => {
        document.getElementById('asyncStep1').classList.remove('running');
        document.getElementById('asyncStep1').classList.add('done');
    }, 800);

    // Step 2: async fetch — doesn't block, runs in background
    setTimeout(() => {
        document.getElementById('asyncStep2').classList.add('running');
        log.textContent = '⚡ Async: fetchData() started — but NOT blocking! Other code continues.';
    }, 1000);

    // Step 3: runs immediately (no blocking!)
    setTimeout(() => {
        document.getElementById('asyncStep3').classList.add('running');
        log.textContent = '⚡ Async: console.log("End") runs while fetchData() works in background!';
    }, 1500);

    setTimeout(() => {
        document.getElementById('asyncStep3').classList.remove('running');
        document.getElementById('asyncStep3').classList.add('done');
    }, 2000);

    // Fetch finishes
    setTimeout(() => {
        document.getElementById('asyncStep2').classList.remove('running');
        document.getElementById('asyncStep2').classList.add('done');
        document.getElementById('asyncTotal').innerHTML = 'Total: <strong>~3s (parallel)</strong>';

        log.textContent = '✅ Async finishes faster because tasks run in parallel, not sequentially!';
        log.style.background = 'var(--accent-success-bg)';
        log.style.color = 'var(--accent-success)';

        setTimeout(() => {
            log.style.background = '';
            log.style.color = '';
            asyncDemoRunning = false;
        }, 3000);
    }, 3500);
}

function resetAsyncDemo() {
    asyncDemoRunning = false;
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`syncStep${i}`).className = 'async-step';
        document.getElementById(`asyncStep${i}`).className = 'async-step';
    }
    document.getElementById('syncTotal').innerHTML = 'Total: <strong>?</strong>';
    document.getElementById('asyncTotal').innerHTML = 'Total: <strong>?</strong>';

    const log = document.getElementById('asyncDemoLog');
    log.textContent = '👆 Click "Run Both" to compare sync vs async execution!';
    log.style.background = '';
    log.style.color = '';
}
