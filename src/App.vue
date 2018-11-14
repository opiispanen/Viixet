<template>
<div>
	<nav-bar
		:black="true"
        :fixed="true" 
        :rounded="true">
		<div class="col-xs"></div>
		<div class="col-xs" style="text-align:center;">
			<p>Viixet Vue-Express</p>
		</div>
		<div class="col-xs" style="text-align:center;">
			<span 
				@click="logout" 
				v-if="$userService.user.token"
				style="cursor:pointer;">
				logout
			</span>
		</div>
	</nav-bar>
	<router-view></router-view>
</div>
</template>

<script>
export default {
	name: 'app',
	methods: {
        logout() {
            this.$userService
                .logout()
                .then(() => {
                    this.$router.push({ path: this.$userService.otherwise })
                })
		}
	}
}
</script>