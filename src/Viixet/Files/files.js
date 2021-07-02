import axios from 'axios'

export default {
    namespaced: true,
    state: {
        files: [],
        privileges: {}
    },
    getters: {
        enabled(state) {
            return state.privileges.enabled || false;
        },
        requested(state) {
            return state.privileges.requested || false;
        },
        allFiles(state) {
            return state.files;
        },
        fileById(state) {
            return (fileId) => state.files.filter(row => row.id == fileId)[0] || {name:'',id:null}
        },
        usedSpace(state) {
            const used = state.files.reduce((acc, curr) => acc + curr.size, 0)

            return (used * 0.00000095367432).toFixed(2)
        },
        quota(state) {
            return state.privileges.quota || 0
        },
        mimetypes(state) {
            return state.privileges.mimetypes || ''
        }
    },
    mutations: {
        setPrivileges(state, privileges) {
            state.privileges = privileges;
        },
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
        load({ commit, rootGetters }) {
            return axios.get('/files')
                .then((response) => {
                    const data = response.data;
                    const activeGroup = rootGetters['groups/activeGroup']
                    const privileges = data.privileges.filter((row) => row.group_id == activeGroup.id)[0]
                    
                    if (!!privileges) {
                        commit('setPrivileges', privileges)
                    } else {
                        commit('setPrivileges', {
                            enabled: false,
                            requested: false,
                            hasSpace: 0,
                            used: 0,
                            quota: 0,
                            mimetypes: [],
                            maxsize: 0,
                            group_id: activeGroup.id
                        })
                    }

                    commit('setFiles', data.rows)

                    return response.data;
                })
                .catch((err) => Promise.reject(err));
        },
        upload({ commit, rootGetters }, files) {
            const formData = new FormData();
                
            for(let i = 0; i < files.length; i++ ){
                let file = files[i];
                formData.append('files[' + i + ']', file);
            }
            
            formData.append('groupId', rootGetters['groups/activeGroup'].id)
            
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
        },
        requestPrivileges(context, messages = null) {
            return axios.post('/filerequest', {
                    groupId: context.rootGetters['groups/activeGroup'].id
                })
                .then((response) => {
                    const data = response.data;

                    if (data.success) {
                        context.state.privileges.requested = true;
                    } else {
                        return Promise.reject()
                    }
                })
                .catch((err) => Promise.reject(err))
        }
    }
}