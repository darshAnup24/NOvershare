export function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function switchTab(tabId) {
        // Update button states
        tabButtons.forEach(button => {
            const isSelected = button.dataset.tab === tabId;
            button.classList.toggle('bg-blue-500', isSelected);
            button.classList.toggle('text-white', isSelected);
            button.classList.toggle('bg-gray-300', !isSelected);
            button.setAttribute('aria-selected', isSelected);
        });

        // Update panel visibility
        tabPanels.forEach(panel => {
            panel.classList.toggle('hidden', panel.id !== `${tabId}-panel`);
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
}