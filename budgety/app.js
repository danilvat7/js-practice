const BudgetController = (function() {})();

const UIController = (function() {})();

const AppCtrl = (function(budgetCtrl, UICtrl) {
  const ctrlAddItem = () => {
    console.log('addd item');
  };
  document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

  document.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
      ctrlAddItem();
    }
  });
})(BudgetController, UIController);
