document.addEventListener("DOMContentLoaded", () => {
    const selectedDishes = [];
    const selectedDishesList = document.getElementById("selectedDishesList");
    const addDishButton = document.getElementById("addDishButton");
    const dishesDropdown = document.getElementById("dishesDropdown");

    let dishCounter = 1;

    addDishButton.addEventListener("click", () => {
        const selectedDish = JSON.parse(dishesDropdown.value);
        const uniqueDishName = `${selectedDish.name} ${dishCounter}`;
        dishCounter++;

        const dishToAdd = { ...selectedDish, name: uniqueDishName };
        selectedDishes.push(dishToAdd);

        updateDishList();
    });

    function updateDishList() {
        selectedDishesList.innerHTML = "";
        selectedDishes.forEach((dish, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${dish.name} (Cooking: ${dish.cooking_time} min)`;
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                selectedDishes.splice(index, 1);
                updateDishList();
            });
            listItem.appendChild(removeButton);
            selectedDishesList.appendChild(listItem);
        });
    }

    document.getElementById("cspForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const numBurners = document.getElementById("numBurners").value;
        const numPans = document.getElementById("numPans").value;

        if (selectedDishes.length === 0) {
            alert("Please add at least one dish!");
            return;
        }

        const response = await fetch("/solve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                num_burners: numBurners,
                num_pans: numPans,
                dishes: selectedDishes,
            }),
        });
        

        const data = await response.json();
        displaySteps(data.steps);
        displayDomains(data.domains);
        visualizeSteps(data.steps, data.schedule);
    });

    function displaySteps(steps) {
        const stepsList = document.getElementById("stepsList");
        stepsList.innerHTML = "";

        steps.forEach((step, index) => {
            const stepItem = document.createElement("li");
            stepItem.textContent = `Step ${index + 1}: ${step.action === "cook" ? "Cooking" : "Cleaning"} ${step.dish} using ${step.resource} from ${step.start_time} to ${step.end_time} minutes.`;
            stepsList.appendChild(stepItem);
        });
    }

    function displayDomains(domains) {
        const domainTable = document.getElementById("domainTable");
        domainTable.innerHTML = "";

        domains.forEach((domain, index) => {
            const domainRow = document.createElement("div");
            domainRow.textContent = `Step ${index + 1}: Dish - ${domain.dish}, Pan Availability - ${domain.pan_availability}, Burner Availability - ${domain.burner_availability}`;
            domainTable.appendChild(domainRow);
        });
    }

    function visualizeSteps(steps, schedule) {
        const container = d3.select("#visualization");
        container.selectAll("*").remove();

        const width = container.node().offsetWidth;
        const height = 400;
        const margin = { top: 20, right: 30, bottom: 50, left: 150 };

        const svg = container.append("svg").attr("width", width).attr("height", height);

        const timeScale = d3.scaleLinear()
            .domain([0, d3.max(schedule.map(d => d.cooking_end))])
            .range([margin.left, width - margin.right]);

        const burnerNames = [...new Set(schedule.map(d => `Burner ${d.burner}`))];
        const yScale = d3.scaleBand()
            .domain(burnerNames)
            .range([margin.top, height - margin.bottom])
            .padding(0.1);

        const xAxis = d3.axisBottom(timeScale).ticks(10).tickFormat(d => `${d} min`);
        svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(xAxis);

        const yAxis = d3.axisLeft(yScale);
        svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis);

        svg.selectAll(".cook-bar")
            .data(schedule)
            .enter()
            .append("rect")
            .attr("x", d => timeScale(d.cooking_start))
            .attr("y", d => yScale(`Burner ${d.burner}`))
            .attr("width", d => timeScale(d.cooking_end) - timeScale(d.cooking_start))
            .attr("height", yScale.bandwidth())
            .attr("fill", "green");

        svg.selectAll(".clean-bar")
            .data(schedule)
            .enter()
            .append("rect")
            .attr("x", d => timeScale(d.cleaning_start))
            .attr("y", d => yScale(`Burner ${d.burner}`))
            .attr("width", d => timeScale(d.cleaning_end) - timeScale(d.cleaning_start))
            .attr("height", yScale.bandwidth())
            .attr("fill", "blue");

        svg.selectAll(".bar-label")
            .data(schedule)
            .enter()
            .append("text")
            .attr("x", d => (timeScale(d.cooking_start) + timeScale(d.cooking_end)) / 2)
            .attr("y", d => yScale(`Burner ${d.burner}`) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(d => `${d.dish} (Pan ${d.pan})`);
    }
});
