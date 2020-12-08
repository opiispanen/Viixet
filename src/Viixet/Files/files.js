import axios from 'axios'

export default {
    namespaced: true,
    state: {
        files: []
    },
    getters: {
        allFiles(state) {
            return state.files;
        },
        usedSpace(state) {
            const used = state.files.reduce((acc, curr) => acc + curr.size, 0)

            return (used * 0.00000095367432).toFixed(2)
        }
    },
    mutations: {
        setFiles(state, files) {
            state.files = files;
        },
        addFiles(state, files) {
            state.files = [
                ...state.files,
                ...files
            ]
        }
    },
    actions: {
        load({ commit }) {
            return axios.get('/files')
                .then((response) => {
                    commit('setFiles', response.data.rows)

                    return response.data;
                })
                .catch((err) => Promise.reject(err));
        },
        upload({ commit }, files) {
            const formData = new FormData();
                
            for(let i = 0; i < files.length; i++ ){
                let file = files[i];
                formData.append('files[' + i + ']', file);
            }

            return axios.post('/files',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
                ).then((response) => {
                    commit('addFiles', response.data.rows)
                    
                    return response.data;
                })
                .catch((err) => Promise.reject(err));
        },
        delete({ state }, fileId) {
            return axios.delete('/files/'+fileId)
                .then((response) => {
                    const data = response.data;

                    if (data.success) {
                        const index = state.files.findIndex(file => file.id === fileId)
                        state.files.splice(index, 1)
                    } else {
                        return Promise.reject()
                    }
                })
                .catch((err) => Promise.reject(err))
        }
    }
}