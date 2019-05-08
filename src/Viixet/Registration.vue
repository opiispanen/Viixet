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
    <div class="form-item">
        <label>
            <input type="checkbox" name="consent" v-model="consent">
            I understand and accept the terms of use (above)
        </label>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <button 
                class="button button-wide button-primary"
                :disabled="validForm"
                @click="registration">
                Create account	
            </button>
        </div>
        <div class="col-xs-6" v-if="false">
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
        validForm: false,
		username: '',
		password: '',
        passwordRepeat: '',
        email: '',
        consent: false
	}),
    computed: {
        passwordLegit() {
            return this.password === this.passwordRepeat;
        }
    },
	methods: {
		registration() {
			console.log('consent', this.consent, this.passwordLegit)
            if (!this.passwordLegit || !this.consent)
				return false;
				
			const reg = this.$userService
				.registration({
					username: this.username,
					password: this.password
				})
			
			console.log(reg)

			reg.then((response) => {
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
                                
                                EventBus.$emit('Viixet.onLogin', true);
							})
							.catch((response) => {
                                this.errors.push('Login failed');
                                
                                EventBus.$emit('Viixet.onLogin', false);
							})
                    }
                    
                    EventBus.$emit('Viixet.onRegistration', data.success);
				})
				.catch((response) => {
                    console.log('fail', response);

                    EventBus.$emit('Viixet.onRegistration', false);
				})
		}
	}
}
</script>