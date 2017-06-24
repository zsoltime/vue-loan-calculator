const calculateLoan = (data) => {
  const { amount, apr, months } = data;
  const monthlyRate = ((apr / 100) / 12);
  const monthlyRepayments = (
    monthlyRate +
    monthlyRate / (Math.pow(1 + monthlyRate, months) - 1)
  ) * amount;
  const totalAmount = monthlyRepayments * months;
  const totalCost = totalAmount - amount;

  return {
    monthlyRepayments,
    totalAmount,
    totalCost,
  };
};

Vue.component('count-up', {
  template: '<span :class="className"></span>',
  name: 'count-up',
  props: {
    className: {
      type: String,
      default: '',
    },
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      required: true,
    },
    decimals: {
      type: Number,
      default: 2,
    },
    duration: {
      type: Number,
      default: 1,
    },
    options: {
      type: Object,
      required: false,
      default: () => ({
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
        prefix: '£',
      }),
    },
  },
  data: function() {
    return {
      instance: null,
    };
  },
  watch: {
    end: function(val) {
      if (this.instance && this.instance.update) {
        this.instance.update(val);
      }
    },
  },
  methods: {
    init: function() {
      if (!this.instance) {
        this.instance = new CountUp(
          this.$el,
          this.start,
          this.end,
          this.decimals,
          this.duration,
          this.options,
        );
        this.instance.start();
      }
    },
    destroy: function() {
      this.instance = null;
    },
  },
  mounted: function() {
    this.init();
  },
  beforeDestroy: function() {
    this.destroy();
  },
  start: function() {
    if (this.instance && this.instance.start) {
      this.instance.start();
    }
  },
  pauseResume: function() {
    if (this.instance && this.instance.pauseResume) {
      this.instance.pauseResume();
    }
  },
  reset: function() {
    if (this.instance && this.instance.reset) {
      this.instance.reset();
    }
  },
  update: function(newEndVal) {
    if (this.instance && this.instance.update) {
      this.instance.update(newEndVal);
    }
  },
});

Vue.component('number-field', {
  template: '#number-field',
  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  methods: {
    change: function(e) {
      this.$emit('input', +this.$refs.input.value);
    },
    increment: function(e) {
      this.$refs.input.stepUp();
      this.$emit('input', +this.$refs.input.value);
    },
    decrement: function(e) {
      this.$refs.input.stepDown();
      this.$emit('input', +this.$refs.input.value);
    },
  },
});

new Vue({
  el: '#app',
  data: {
    amount: 1000,
    apr: 5,
    months: 12,
    monthlyRepayments: 0,
    totalAmount: 0,
    totalCost: 0,
  },
  mounted: function() {
    this.recalculate(1000);
  },
  methods: {
    recalculate: function(delay) {
      const loan = calculateLoan({
        amount: this.amount,
        apr: this.apr,
        months: this.months,
      });
      if (delay && Number.isInteger(delay)) {
        setTimeout(() => {
          this.monthlyRepayments = loan.monthlyRepayments;
          this.totalAmount = loan.totalAmount;
          this.totalCost = loan.totalCost;
        }, delay);
      } else {
        this.monthlyRepayments = loan.monthlyRepayments;
        this.totalAmount = loan.totalAmount;
        this.totalCost = loan.totalCost;
      }
    },
  },
  computed: {
    // I just use this to be able to watch all three number field changes below
    watchFields: function() {
      return { amount: this.amount, apr: this.apr, months: this.months};
    },
  },
  watch: {
    watchFields: function() {
      this.recalculate();
    },
  },
  filters: {
    currency: function(val) {
      return val.toLocaleString('en-GB', {
        style: 'currency',
        currency: 'GBP',
      });
    },
  },
});
