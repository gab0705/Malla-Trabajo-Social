document.addEventListener('DOMContentLoaded', () => {
    const courses = document.querySelectorAll('.course');
    // Usamos un Set para almacenar los IDs de los cursos aprobados para un acceso y manejo eficiente.
    let passedCourses = new Set(JSON.parse(localStorage.getItem('passedCourses')) || []);

    /**
     * Actualiza el estado visual de un único elemento de curso (aprobado, bloqueado, o disponible).
     * @param {HTMLElement} courseElement El elemento DOM del botón del curso.
     */
    const updateCourseVisualState = (courseElement) => {
        const courseId = courseElement.id;
        // Obtener los prerrequisitos y limpiar espacios en blanco.
        const prereqIds = courseElement.dataset.prereq ? courseElement.dataset.prereq.split(',').map(id => id.trim()) : [];

        if (passedCourses.has(courseId)) {
            // Si el curso ya está en la lista de aprobados
            courseElement.classList.add('passed');
            courseElement.classList.remove('locked');
        } else {
            // Si el curso no está aprobado, verificar sus prerrequisitos
            const allPrereqsMet = prereqIds.every(prereqId => passedCourses.has(prereqId));

            if (allPrereqsMet) {
                // Si todos los prerrequisitos se cumplen, el curso está disponible
                courseElement.classList.remove('locked');
            } else {
                // Si no se cumplen los prerrequisitos, el curso está bloqueado
                courseElement.classList.add('locked');
            }
            // Asegurarse de que no tenga la clase 'passed' si no está realmente aprobado
            courseElement.classList.remove('passed');
        }
    };

    /**
     * Itera sobre todos los cursos y actualiza su estado visual.
     * Esto es útil después de cargar la página o de aprobar una materia.
     */
    const updateAllCourseStates = () => {
        courses.forEach(updateCourseVisualState);
    };

    // --- Inicialización al cargar la página ---
    updateAllCourseStates(); // Aplica los estados guardados y bloquea/desbloquea según prerrequisitos.

    // --- Añadir el event listener a cada botón de curso ---
    courses.forEach(course => {
        course.addEventListener('click', () => {
            const courseId = course.id;

            // Solo permitir la acción de aprobar si el curso NO está bloqueado
            // y aún NO ha sido marcado como aprobado.
            if (!course.classList.contains('locked') && !passedCourses.has(courseId)) {
                // 1. Marcar el curso como aprobado en nuestro Set
                passedCourses.add(courseId);

                // 2. Guardar el estado actualizado en localStorage
                // Convertimos el Set de nuevo a un Array para poder guardarlo.
                localStorage.setItem('passedCourses', JSON.stringify(Array.from(passedCourses)));

                // 3. Volver a verificar y actualizar el estado de TODOS los cursos.
                // Esto es crucial para desbloquear las materias que dependen de esta recién aprobada.
                updateAllCourseStates();
            }
        });
    });
});
