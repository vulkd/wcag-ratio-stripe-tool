<template functional>
  <button class="ml-3 rounded shadow font-semibold bg-white py-1 px-3 h-8">
  	<Icon v-if="props.icon" :name="props.icon" class="mr-2" scale=".8"></Icon>
  	<slot></slot>
  </button>
</template>

<script>
  export default {
  	props: {
  		icon: String
  	}
  };
</script>
