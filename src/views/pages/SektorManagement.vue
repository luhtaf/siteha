<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Sektor</h5>

                <Toast />
                <ConfirmDialog />

                <div class="flex justify-content-end mb-3">
                    <Button label="Tambah Sektor" icon="pi pi-plus" @click="openNew" />
                </div>

                <AppDataTable :value="sektor" :loading="loading" dataKey="id" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" :columns="columns" @column-action="handleColumnAction">
                    <template #empty> Tidak ada sektor yang ditemukan. Tambahkan sektor pertama Anda sekarang! </template>

                    <template #loading> Memuat data sektor. Mohon tunggu... </template>
                </AppDataTable>

                <Dialog v-model:visible="sektorDialog" :style="{ width: '450px' }" header="Detail Sektor" :modal="true" class="p-fluid">
                    <div class="card flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="name">Nama</label>
                            <InputText id="name" v-model.trim="sektorItem.name" :class="{ 'p-invalid': submitted && !sektorItem.name }" />
                            <small class="p-error" v-if="submitted && !sektorItem.name">Nama diperlukan.</small>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="description">Deskripsi</label>
                            <Textarea id="description" v-model="sektorItem.description" rows="3" />
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Simpan" icon="pi pi-check" class="p-button-text" @click="saveSektor" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import AppDataTable from '@/components/AppDataTable.vue';
import { useSektor } from '@/composables/useSektor';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const confirm = useConfirm();
const { sektor, loading, error, loadSektor, addSektor, updateSektor, deleteSektor } = useSektor();

// UI state
const sektorDialog = ref(false);
const submitted = ref(false);
const sektorItem = ref({
    id: null,
    name: '',
    description: '',
    createdAt: null
});

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Column definitions for AppDataTable
// Example of safe column definitions
const columns = [
    {
        field: 'name',
        header: 'Nama',
        sortable: true
    },
    {
        field: 'description',
        header: 'Deskripsi',
        sortable: true
    },
    {
        field: 'createdAt',
        header: 'Tanggal Dibuat',
        sortable: true,
        body: (data) => formatDate(data.createdAt)
    },
    {
        field: 'actions',
        header: 'Aksi',
        body: (data) => ({
            type: 'buttons',
            actions: [
                {
                    type: 'edit',
                    id: data.id,
                    icon: 'pi pi-pencil',
                    class: 'p-button-rounded p-button-success mr-2'
                },
                {
                    type: 'delete',
                    id: data.id,
                    icon: 'pi pi-trash',
                    class: 'p-button-rounded p-button-danger'
                }
            ]
        })
    }
];

// Handle column actions
const handleColumnAction = (actionType, id) => {
    const item = sektor.value.find((s) => s.id === id);
    if (!item) return;

    if (actionType === 'edit') {
        editSektor(item);
    } else if (actionType === 'delete') {
        confirmDeleteSektor(item);
    }
};

// Open dialog for new sektor
const openNew = () => {
    sektorItem.value = {
        id: null,
        name: '',
        description: '',
        createdAt: new Date().toISOString()
    };
    submitted.value = false;
    sektorDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
    sektorDialog.value = false;
    submitted.value = false;
};

// Edit existing sektor
const editSektor = (data) => {
    sektorItem.value = { ...data };
    sektorDialog.value = true;
};

// Save sektor (add or update)
const saveSektor = async () => {
    submitted.value = true;

    if (sektorItem.value.name.trim()) {
        if (sektorItem.value.id) {
            // Update existing sektor
            const result = await updateSektor(sektorItem.value);
            if (result) {
                toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Sektor Diperbarui', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Gagal memperbarui sektor', life: 3000 });
            }
        } else {
            // Add new sektor
            const result = await addSektor({
                ...sektorItem.value,
                createdAt: new Date().toISOString()
            });
            if (result) {
                toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Sektor Dibuat', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Gagal membuat sektor', life: 3000 });
            }
        }

        sektorDialog.value = false;
        sektorItem.value = {};
    }
};

// Delete sektor with confirmation
const confirmDeleteSektor = (data) => {
    confirm.require({
        message: `Apakah Anda yakin ingin menghapus ${data.name}?`,
        header: 'Konfirmasi',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            deleteSektor(data.id);
            toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Sektor Dihapus', life: 3000 });
        }
    });
};

// Initialize component
onMounted(() => {
    loadSektor();
});
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
