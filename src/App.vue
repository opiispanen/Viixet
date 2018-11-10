<template>
<div>
	<nav-bar
		:black="true"
        :fixed="true" 
        :rounded="true">
		<div class="col-xs" style="text-align:center;">
			<p>Viixet Vue-Express</p>
		</div>
	</nav-bar>
	<router-view></router-view>
</div>
</template>

<script>
export default {
	name: 'app'
}
</script>