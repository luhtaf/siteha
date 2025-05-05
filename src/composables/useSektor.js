import { onMounted, ref } from 'vue';

export function useSektor() {
    const sektor = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Load sektor from localStorage
    const loadSektor = () => {
        loading.value = true;
        try {
            const storedSektor = localStorage.getItem('sektor');
            sektor.value = storedSektor ? JSON.parse(storedSektor) : [];
        } catch (err) {
            error.value = 'Failed to load sektor: ' + err.message;
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    // Add a new sektor
    const addSektor = (sektorItem) => {
        loading.value = true;
        try {
            // Generate a new ID (in a real API this would be handled by the backend)
            const newId = Date.now().toString();
            const newSektor = { ...sektorItem, id: newId };

            // Add to the sektor array
            sektor.value.push(newSektor);

            // Save to localStorage
            localStorage.setItem('sektor', JSON.stringify(sektor.value));
            return newSektor;
        } catch (err) {
            error.value = 'Failed to add sektor: ' + err.message;
            console.error(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    // Update existing sektor
    const updateSektor = (updatedSektor) => {
        loading.value = true;
        try {
            // Find the index of the sektor to update
            const index = sektor.value.findIndex((s) => s.id === updatedSektor.id);
            if (index !== -1) {
                // Update the sektor in the array
                sektor.value[index] = updatedSektor;

                // Save to localStorage
                localStorage.setItem('sektor', JSON.stringify(sektor.value));
                return updatedSektor;
            } else {
                throw new Error('Sektor not found');
            }
        } catch (err) {
            error.value = 'Failed to update sektor: ' + err.message;
            console.error(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    // Delete a sektor
    const deleteSektor = (id) => {
        loading.value = true;
        try {
            // Filter out the sektor with the given ID
            sektor.value = sektor.value.filter((s) => s.id !== id);

            // Save to localStorage
            localStorage.setItem('sektor', JSON.stringify(sektor.value));
            return true;
        } catch (err) {
            error.value = 'Failed to delete sektor: ' + err.message;
            console.error(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Initialize data on component mount
    onMounted(() => {
        loadSektor();
    });

    return {
        sektor,
        loading,
        error,
        loadSektor,
        addSektor,
        updateSektor,
        deleteSektor
    };
}
