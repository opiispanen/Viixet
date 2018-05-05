<template>
<div class="login-form">
    <div class="form-item" v-if="false">
        <label>
            <span class="form-item--label">
                Email
            </span>
            <input type="email" name="email" v-model="email">
        </label>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Username
            </span>
            <input type="text" name="username" v-model="username">
        </label>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Password
            </span>
            <input type="password" name="password" v-model="password">
        </label>
    </div>
    <div class="form-item">
        <label>
            <span class="form-item--label">
                Repeat password
            </span>
            <input type="password" name="password-repeat" v-model="passwordRepeat">
        </label>
        <span class="badge badge-danger" v-if="password.length && passwordRepeat.length && !passwordLegit">
            Passwords don't match
        </span>
    </div>
    <div class="row">
        <div class="col-xs-6">
            <button 
                class="button button-wide button-primary"
                @click="registration">
                Save	
            </button>
        </div>
        <div class="col-xs-6">
            <router-link 
                class="button button-wide"
                :to="{ name: 'SignIn' }">
                Cancel
            </router-link>
            <button 
                class="button button-wide"
                v-if="false"
                @click="$emit('ViixetRegistration.cancel')">
                Cancel	
            </button>
        </div>
    </div>
</div>
</template>

<script>
export default {
	name: 'ViixetRegistration',
	data: () => ({
		username: '',
		password: '',
        passwordRepeat: '',
        email: ''
	}),
    computed: {
        passwordLegit() {
            return this.password === this.passwordRepeat;
        }
    },
	methods: {
		registration() {
			console.log('registration',!this.passwordLegit, this.password, this.passwordRepeat)
            if (!this.passwordLegit)
				return false;
				
			const reg = this.$userService
				.registration({
					username: this.username,
					password: this.password
				})
			
			console.log(reg)

			reg
				.then((response) => {
					const data = response.data;

					if (data.success) {
						this.$userService
							.login(this.username, this.password)
							.then((response) => {
								const 
									callbackState = this.$userService.callbackState,
									callbacks = this.$userService.callbacks

								callbacks.forEach((callback) => callback())

								this.$router.push(callbackState)

								this.$userService.reset();
							})
							.catch((response) => {
								this.errors.push('Login failed')
							})
					}
				})
				.catch((response) => {
					console.log('fail', response)
				})
		}
	}
}
</script>