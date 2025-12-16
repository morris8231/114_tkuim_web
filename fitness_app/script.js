document.addEventListener('DOMContentLoaded', () => {

    // --- Helper Functions ---
    const showElement = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('animate-fade-in'); // Assumption: using Tailwind or custom CSS animation
        }
    }

    const validateInput = (...inputs) => {
        for (let input of inputs) {
            const val = parseFloat(input.value);
            if (isNaN(val) || val <= 0) {
                alert('Please enter valid positive numbers!');
                return false;
            }
        }
        return true;
    }

    // --- BMI Logic ---
    const bmiBtn = document.getElementById('calculate-bmi');
    if (bmiBtn) {
        bmiBtn.addEventListener('click', () => {
            const heightInput = document.getElementById('height');
            const weightInput = document.getElementById('weight');

            if (!validateInput(heightInput, weightInput)) return;

            const h = parseFloat(heightInput.value) / 100; // cm to m
            const w = parseFloat(weightInput.value);
            const bmi = (w / (h * h)).toFixed(1);

            const valueEl = document.getElementById('bmi-value');
            const statusEl = document.getElementById('bmi-status');
            const descEl = document.getElementById('bmi-description');

            valueEl.textContent = bmi;

            let statusText = '';
            let statusColor = '';
            let descText = '';

            if (bmi < 18.5) {
                statusText = 'Underweight';
                statusColor = 'text-yellow-400';
                statusEl.className = 'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-yellow-400/20 text-yellow-400 mb-4';
                descText = 'You are in the underweight range. Focus on a caloric surplus with nutrient-dense foods and strength training to build mass.';
            } else if (bmi >= 18.5 && bmi <= 24) {
                statusText = 'Normal';
                statusColor = 'text-neonGreen';
                statusEl.className = 'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-green-500/20 text-green-400 mb-4';
                descText = 'You have a healthy body weight. Maintain your current activity levels and balanced diet to stay in this optimal zone.';
            } else {
                statusText = 'Overweight';
                statusColor = 'text-red-500';
                statusEl.className = 'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-500/20 text-red-400 mb-4';
                descText = 'You are above the standard weight range. Consider a slight caloric deficit combined with consistent cardio and resistance training.';
            }

            statusEl.textContent = statusText;
            descEl.textContent = descText;

            showElement('bmi-result');
        });
    }

    // --- Hypertrophy Logic ---
    const hyperBtn = document.getElementById('calculate-hypertrophy');
    if (hyperBtn) {
        hyperBtn.addEventListener('click', () => {
            const daysInput = document.getElementById('days');
            const minsInput = document.getElementById('minutes');

            if (!validateInput(daysInput, minsInput)) return;

            const days = parseFloat(daysInput.value);
            const mins = parseFloat(minsInput.value);
            const volume = days * mins;

            const statusTitle = document.getElementById('status-title');
            const statusIconContainer = document.getElementById('status-icon-container');
            const descEl = document.getElementById('status-description');

            let title = '';
            let icon = '';
            let colorClass = '';
            let desc = '';

            if (volume > 150 && days >= 3) {
                title = 'High Hypertrophy Potential';
                icon = '<i class="fa-solid fa-fire text-neonBlue"></i>';
                colorClass = 'text-neonBlue';
                desc = 'Excellent! Your training volume is optimized for muscle growth. Ensure you are getting enough protein and sleep to support this intensity.';
            } else if (volume >= 60 && volume <= 150) {
                title = 'Maintenance Mode';
                icon = '<i class="fa-solid fa-shield-halved text-neonPurple"></i>';
                colorClass = 'text-neonPurple';
                desc = 'Good job. This volume is sufficient to maintain your current physique and health. To maximize growth, consider increasing frequency or duration.';
            } else {
                title = 'Undertraining';
                icon = '<i class="fa-solid fa-battery-quarter text-yellow-500"></i>';
                colorClass = 'text-yellow-500';
                desc = 'Your current volume might be too low for significant muscle adaptation. Try to schedule at least 3 sessions of 45+ minutes per week.';
            }

            statusTitle.textContent = title;
            statusTitle.className = `text-2xl font-extrabold mb-2 leading-tight ${colorClass}`;
            statusIconContainer.innerHTML = icon;
            descEl.textContent = desc;

            showElement('analysis-result');
        });
    }
});
