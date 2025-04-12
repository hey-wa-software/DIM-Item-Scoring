// Item-Scoring Extension for Destiny Item Manager
// Copyright (C) 2025 Michael Johnson
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

class Inventory {
    #DrawerClassName = "C09jLGoT";
    #CompareDrawerParentElementId = "temp-container";
    #ItemColumnElementClass = "pTQoALS1";
    #ScoreValueElementClass = "scoreValue";
    #StatNameElementClass = "mcdkY1aj";
    #StatValueElementClass = "K9b835Dp";
    #SortDecreasingClass = "sjSbUvMJ";
    #SortIncreasingClass = "r0eY0kZ5";

    #Background() {
        let now = new Date().toLocaleString();
        this.AddScoreStat(
            "BULLETS!",
            [
                { name: "RPM", operator: "*" },
                { name: "Impact", operator: "*" },
                { name: "Range", operator: "*" },
                { name: "Stability", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
            ],
            ["Auto Rifle", "Machine Gun", "Pulse Rifle", "Trace Rifle", "Submachine Gun"]
        );
        this.AddScoreStat(
            "ARROWS!",
            [
                { name: "Impact", operator: "*" },
                { name: "Accuracy", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Draw Time", operator: "/" },
            ],
            ["Combat Bow"]
        );
        this.AddScoreStat(
            "STICKS!",
            [
                { name: "RPM", operator: "*" },
                { name: "Impact", operator: "*" },
                { name: "Range", operator: "*" },
                { name: "Handling", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
            ],
            ["Glaive"]
        );
        this.AddScoreStat(
            "BLADES!",
            [
                { name: "Swing Speed", operator: "*" },
                { name: "Impact", operator: "*" },
                { name: "Charge Rate", operator: "*" },
                { name: "Ammo Capacity", operator: "*" },
            ],
            ["Sword"]
        );
        this.AddScoreStat(
            "ZAP!",
            [
                { name: "Impact", operator: "*" },
                { name: "Range", operator: "*" },
                { name: "Handling", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
                { name: "Charge Time", operator: "/" },
                { name: "Zoom", operator: "/" },
            ],
            ["Fusion Rifle", "Linear Fusion Rifle"]
        );
        this.AddScoreStat(
            "BANG!",
            [
                { name: "RPM", operator: "*" },
                { name: "Impact", operator: "*" },
                { name: "Range", operator: "*" },
                { name: "Stability", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
                { name: "Handling", operator: "/" },
                { name: "Zoom", operator: "/" },
            ],
            ["Hand Cannon", "Scout Rifle", "Sniper Rifle"]
        );
        this.AddScoreStat(
            "BOOM!",
            [
                { name: "RPM", operator: "*" },
                { name: "Impact", operator: "*" },
                { name: "Range", operator: "*" },
                { name: "Stability", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
                { name: "Handling", operator: "/" },
                { name: "Zoom", operator: "/" },
            ],
            ["Shotgun"]
        );
        this.AddScoreStat(
            "POP!",
            [
                { name: "RPM", operator: "*" },
                { name: "Impact", operator: "*", optional: true },
                { name: "Blast Radius", operator: "*", optional: true },
                { name: "Velocity", operator: "*", optional: true },
                { name: "Range", operator: "*", optional: true },
                { name: "Stability", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
                { name: "Handling", operator: "/" },
                { name: "Zoom", operator: "/" },
                { name: "Charge Time", operator: "/", optional: true },
            ],
            ["Sidearm"]
        );
        this.AddScoreStat(
            "THUP!",
            [
                { name: "RPM", operator: "*" },
                { name: "Blast Radius", operator: "*" },
                { name: "Velocity", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Magazine", operator: "*" },
            ],
            ["Grenade Launcher"]
        );
        this.AddScoreStat(
            "ROCKETS!",
            [
                { name: "RPM", operator: "*" },
                { name: "Blast Radius", operator: "*" },
                { name: "Velocity", operator: "*" },
                { name: "Stability", operator: "*" },
                { name: "Reload", operator: "*" },
                { name: "Aim", operator: "*" },
                { name: "Airborne", operator: "*" },
                { name: "Magazine", operator: "*" },
                { name: "Zoom", operator: "/" },
            ],
            ["Rocket Launcher"]
        );
        setTimeout(() => this.#Background(), 2000);
    }

    AddScoreStat(scoreStatName, scoringStats, requiredArchetypes) {
        if (!scoreStatName) {
            console.error("Please specify the stat (row name) where the score will be published, e.g. 'my score'.");
            return false;
        }
        if (!scoringStats || scoringStats.length < 1) {
            console.error("Please specify one or more stat names paired with whether they appear on the numerator ('*') or denominator ('/'), e.g. [{stat: 'Charge Time', operator: '/'}, {stat: 'Impact', operator: '*'}, ...].");
            return false;
        }
        if (!requiredArchetypes) {
            console.error("Please specify one or more compatible item archetypes, e.g. ['Fusion Rifle', 'Linear Fusion Rifle'].");
            return false;
        }
        if (!this.IsCompareDrawerOpen()) {
            // console.debug("Item comparer is not open.");
            return false;
        }
        if (this.GetItemColumnCount() == 1) {
            // console.debug(`There are too few items to compare.`);
            return false;
        } else {
            // console.debug(`'${scoreStatName}' has not yet been calculated.`);
        }

        // Check for unsupported archetype.
        const archetypeName = this.GetItemArchetypeName();
        if (!requiredArchetypes.includes(archetypeName)) {
            // let archetypesString = requiredArchetypes
            //     .map((e) => `'${e}'`) // Wrap each element in quotes.
            //     .reduce((a, b) => `${a}, ${b}`); // Create a CSV from the elements.
            // console.debug(`The comparer contains items of type '${archetype}', which is not in [${archetypesString}].`);
            return false;
        }

        // Check for required stat names.
        const statNameElementArray = Array.from(this.GetStatNameElements());
        const availableStatNames = statNameElementArray.map(element => element.innerText);
        let areAllRequiredStatNamesPresent = true;
        let missingStatName = "";

        for (let scoringStat of scoringStats) {
            let scoringStatName = scoringStat.name;
            let isStatOptional = scoringStat.hasOwnProperty("optional") ? scoringStat.optional : false;
            areAllRequiredStatNamesPresent &&= isStatOptional || availableStatNames.includes(scoringStatName);
            if (!areAllRequiredStatNamesPresent) {
                missingStatName = scoringStatName;
                break;
            }
        }

        if (!areAllRequiredStatNamesPresent) {
            const itemName = this.GetItemName(0);
            console.warn(`The required stat name '${missingStatName}' was not found in the comparer for '${itemName}' (${archetypeName}).`);
            return false;
        }

        this.AddRowTitle(scoreStatName, scoringStats)
            && this.AddColumnValues(scoreStatName, scoringStats)
            && this.ColorDpsColumns(scoreStatName);
        return true;
    }

    AddColumnValues(scoreStatName, scoringStats) {
        let itemElementArray = Array.from(this.GetItemColumnElements());
        let itemCount = itemElementArray.length;
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            // Insert the score stat as a placeholder before calculating its value
            // so that GetItemStatValueByName() will look in the correct row for
            // the named stat.
            const itemStatValueElements = this.GetItemStatValueElementsByIndex(itemIndex);
            const itemStatValueElementsContainer = itemStatValueElements[0].parentElement.parentElement;

            // Delete any existing score stat so that it can be recalculated.
            // Useful when the collection of items being compared changes.
            const existingItemScoreStatValueElementContainers = itemStatValueElementsContainer
                .getElementsByClassName(this.#ScoreValueElementClass);
            for (let existingItemScoreStatValueElementContainer of existingItemScoreStatValueElementContainers) {
                console.debug(`Found and will delete '${existingItemScoreStatValueElementContainer.outerHTML}'.`);
                existingItemScoreStatValueElementContainer.remove();
            }

            const insertBeforeStatValueIndex = this.GetStatNameIndexByName(scoreStatName);
            const insertBeforeStatValueElement = itemStatValueElements[insertBeforeStatValueIndex - 1];
            const insertBeforeStatValueElementContainer = insertBeforeStatValueElement.parentElement;

            // Create and insert a placeholder score stat element and calculate its value later.
            const itemScoreStatValueElementContainer
                = this.CreateItemStatValueElementContainer(0 /* placeholder value */);
            const newItemScoreStatValueElementContainer = itemStatValueElementsContainer
                .insertBefore(itemScoreStatValueElementContainer, insertBeforeStatValueElementContainer);

            // Calculate the correct score for this item.
            let numerator = 1;
            let denominator = 1;
            // Modify the numerator and denominator according to each stat's contribution.
            for (let scoringStat of scoringStats) {
                let statName = scoringStat.name;
                let statOperator = scoringStat.operator;
                let statValue = this.GetItemStatValueByName(itemIndex, statName);
                switch (statOperator) {
                    case '*':
                        // This stat's value contributes to the numerator.
                        numerator *= isNaN(statValue) ? 1 : (statValue == 0) ? 1 : statValue;
                        if (numerator == 0) {
                            const itemName = this.GetItemName(itemIndex);
                            console.warn(`Unexpectedly zero numerator for '${statName}' in '${itemName}'.`);
                        }
                        break;
                    case '/':
                        // This stat's value contributes to the denominator.
                        denominator *= isNaN(statValue) ? 1 : (statValue == 0) ? 1 : statValue;
                        if (denominator == 0) {
                            const itemName = this.GetItemName(itemIndex);
                            console.error(`Unexpectedly zero denominator for '${statName}' in '${itemName}'.`);
                        }
                        break;
                    default:
                        console.warn(`Unsupported operator '${statOperator}' for '${statName}' in '${itemName}'.`);
                }
            }

            // Calculate the item's score as a ratio.
            const itemScore = (numerator / denominator).toFixed(3);

            // Update the item's score placeholder value with its newly calculated value.
            this.UpdateItemStatValueElement(newItemScoreStatValueElementContainer, itemScore);
        }
        return true;
    }

    AddRowTitle(rowTitle, scoringStats) {
        if (this.IsStatNamePresent(rowTitle)) {
            // This row has already been added.
            return true;
        }

        // Generate a human-readable formula explaining how the score is calculated.
        const statNumerators = scoringStats
            .filter(stat => stat.operator === '*')
            .map(stat => stat.name);
        const numeratorFormula = (statNumerators.length == 0)
            ? "1"
            : statNumerators.reduce((names, name) => `${names} ✖ ${name}`);
        const statDenominators = scoringStats
            .filter(stat => stat.operator === '/')
            .map(stat => stat.name);
        const denominatorFormula = (statDenominators.length == 0)
            ? "1"
            : statDenominators.reduce((names, name) => `${names} ✖ ${name}`);
        const scoringFormula = `(${numeratorFormula}) ➗ (${denominatorFormula})`;

        const statNameElements = this.GetStatNameElements();
        const insertBeforeStatNameElement = statNameElements[1]; // [0]: item name, [1]: Power.
        const exampleStatNameElement = statNameElements[2];
        const newStatNameElement = exampleStatNameElement.cloneNode(true);
        insertBeforeStatNameElement.parentElement.insertBefore(newStatNameElement, insertBeforeStatNameElement);
        newStatNameElement.setAttribute("class",`${newStatNameElement.className} ${this.#StatNameElementClass}`);
        newStatNameElement.setAttribute("title", scoringFormula);
        newStatNameElement.textContent = rowTitle;
        newStatNameElement.onclick = (event) => {
            const statNameElement = event.target;
            const isUnsorted = statNameElement.className === this.#StatNameElementClass;
            const isSortedDecreasing = statNameElement.className.includes(this.#SortDecreasingClass);
            const newClass = this.#StatNameElementClass
                + " "
                + ((isUnsorted || isSortedDecreasing)
                    ? this.#SortIncreasingClass
                    : this.#SortDecreasingClass);
            statNameElement.setAttribute("class", newClass);

            const itemElements = this.GetItemColumnElements();
            const itemElementArray = Array.from(itemElements);
            
            itemElementArray.sort(
                (a, b) => {
                    let columnIndexA = itemElementArray.indexOf(a);
                    let columnIndexB = itemElementArray.indexOf(b);
                    let scoreA = this.GetItemStatValueByName(columnIndexA, rowTitle);
                    let scoreB = this.GetItemStatValueByName(columnIndexB, rowTitle);
                    return (isUnsorted || isSortedDecreasing) ? scoreA - scoreB : scoreB - scoreA;
                }
            );

            // Sort the columns by replacing the original children with a sorted copy.
            const itemElementContainer = itemElements[0].parentElement;
            itemElementContainer.replaceChildren();
            itemElementArray.forEach(itemElement => {
                itemElementContainer.appendChild(itemElement);
            });
        };
        return true;
    }

    ColorDpsColumns(scoreStatName) {
        const itemCount = this.GetItemColumnCount();
        let itemScoreMax = 0;

        // Find the maximum value.
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            const itemScore = parseFloat(this.GetItemStatValueByName(itemIndex, scoreStatName));
            if (itemScore > itemScoreMax) {
                itemScoreMax = itemScore;
            }
        }

        // Apply color to the max, 90% max, 80% max, and lower values.
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            const itemScoreElement = this.GetItemStatValueElementByName(itemIndex, scoreStatName);
            const itemScoreValue = parseFloat(this.GetItemStatValueByName(itemIndex, scoreStatName));
            const normalizedScore = (itemScoreValue / itemScoreMax).toFixed(3);
            const itemScoreValueElement = itemScoreElement.getElementsByTagName("span")[0];
            itemScoreValueElement.textContent = normalizedScore;
            if (normalizedScore > 0.99) {
                // Cyanish for top 1%.
                itemScoreElement.setAttribute("style", "color: rgb(45,183,210)");
            }
            else if (normalizedScore > 0.90) {
                // Greenish for top 10%.
                itemScoreElement.setAttribute("style", "color: rgb(45,210,45)");
            }
            else if (normalizedScore > 0.75) {
                // Yellowish for top 25%.
                itemScoreElement.setAttribute("style", "color: rgb(210,210,45)");
            }
            else if (normalizedScore > 0.50) {
                // Orangish for top 50%.
                itemScoreElement.setAttribute("style", "color: rgb(210,140,45)");
            }
            else {
                // Reddish for lower scores.
                itemScoreElement.setAttribute("style", "color: rgb(210,45,45)");
            }
        }
        // No errors were encountered.
        return true;
    }

    CreateItemStatValueElementContainer(itemStatValue) {
        const existingStatValueElements = document.getElementsByClassName(this.#StatValueElementClass);
        const exampleStatValueElement = existingStatValueElements[2]; // [0] is "Power" which doesn't match other stats.
        const exampleStatValueElementContainer = exampleStatValueElement.parentElement; // Stat value elements are wrapped.
        const newStatValueElementContainer = exampleStatValueElementContainer.cloneNode(true);
        newStatValueElementContainer.className += " " + this.#ScoreValueElementClass;
        const newStatValueElement = newStatValueElementContainer.getElementsByTagName("span");
        newStatValueElement.textContent = itemStatValue;
        return newStatValueElementContainer;
    }

    UpdateItemStatValueElement(statValueElementContainer, statValue) {
        const statValueSpan = statValueElementContainer.getElementsByTagName("span")[0];
        statValueSpan.textContent = statValue;
        // No errors were encountered.
        return true;
    }

    GetDrawerElement() {
        const elements = document.body.getElementsByClassName(this.#DrawerClassName);
        return elements.length > 0 ? elements[0] : undefined;
    }

    GetItemArchetypeName() {
        if (!this.IsCompareDrawerOpen()) {
            // console.debug("Item comparer is not open.");
            return false;
        }

        const compareElement = document.getElementById(this.#CompareDrawerParentElementId);
        const buttonElements = compareElement.getElementsByClassName("RMJmuSye o3oKAnUN riJK1dNz");
        let lockButtonElements = Array.from(buttonElements).filter(
            element =>
                element.title.startsWith("Unlock")
               || element.title.startsWith("Lock"));
        if (lockButtonElements && lockButtonElements.length > 0) {
            let firstLockButtonElement = lockButtonElements[0];
            let title = firstLockButtonElement.title;
            let tokens = title.split(" ");
            tokens.shift(); // Remove "Lock" or "Unlock".
            tokens.pop(); // Remove "[L]".
            let archetypeName = tokens.reduce((a, b) => `${a} ${b}`);
            return archetypeName;
        }
        const itemName = this.GetItemName(0);
        console.warn(`No lock buttons found in the comparer.  Can't determine archetype of '${itemName}'.`);
        return undefined;
    }

    GetItemColumnCount() {
        return this.GetItemColumnElements().length;
    }

    GetItemColumnElement(itemIndex) {
        return this.GetItemColumnElements()[itemIndex];
    }

    GetItemColumnElements() {
        return document.getElementsByClassName(this.#ItemColumnElementClass);
    }

    GetItemColumnStatValueElements(itemColumnElement) {
        return itemColumnElement.getElementsByClassName(this.#StatValueElementClass);
    }

    GetItemName(itemIndex) {
        const itemColumnElement = this.GetItemColumnElement(itemIndex);
        const itemColumnStatValueElements = this.GetItemColumnStatValueElements(itemColumnElement);
        const itemNameElement = itemColumnStatValueElements[0].parentElement.previousElementSibling;
        const itemName = itemNameElement.textContent;
        return itemName;
    }

    GetItemStatValue(itemIndex, statIndex) {
        const statValueElement = this.GetItemStatValueElement(itemIndex, statIndex);
        return statValueElement?.textContent ?? "0";
    }

    GetItemStatValueByName(itemIndex, statName) {
        const statValueIndex = this.GetItemStatValueIndexByName(itemIndex, statName);
        let statValue = this.GetItemStatValue(itemIndex, statValueIndex);
        statValue = isNaN(statValue) ? 0 : statValue;
        return statValue;
    }

    GetItemStatValueElement(itemIndex, statIndex) {
        const itemColumnElement = this.GetItemColumnElements()[itemIndex];
        const itemStatValueElements = this.GetItemColumnStatValueElements(itemColumnElement);
        const itemStatValueElement = itemStatValueElements[statIndex];
        return itemStatValueElement;
    }

    GetItemStatValueElementByName(itemIndex, statName) {
        const itemStatValueIndex = this.GetItemStatValueIndexByName(itemIndex, statName);
        const itemStatValueElement = this.GetItemStatValueElement(itemIndex, itemStatValueIndex);
        return itemStatValueElement;
    }

    GetItemStatValueElementsByIndex(itemIndex) {
        const itemColumnElement = this.GetItemColumnElement(itemIndex);
        const itemStatValueElements = this.GetItemColumnStatValueElements(itemColumnElement);
        return itemStatValueElements;
    }

    GetStatNameIndexByName(statName) {
        const statNameElements = this.GetStatNameElements();
        const statCount = statNameElements.length;
        for (let statIndex = 0; statIndex < statCount; statIndex++) {
            let statNameElement = statNameElements[statIndex];
            if (statNameElement.innerText.trim() == statName.trim()) {
                return statIndex;
            }
        }
        // The stat name was not found.
        return NaN;
    }

    GetItemStatValueIndexByName(itemIndex, statName){
        const statNameIndex = this.GetStatNameIndexByName(statName);
        const statValueIndex = statNameIndex - 1; // The stat value array is offset from the name array by 1.
        return statValueIndex;
    }

    GetStatNameElements() {
        return document.body.getElementsByClassName(this.#StatNameElementClass);
    }

    IsCompareDrawerOpen() {
        const drawerElement = this.GetDrawerElement();
        if (drawerElement) {
            const isCompareDrawer = drawerElement
                .textContent
                .toLowerCase()
                .includes("assume masterworked");
            return isCompareDrawer;
        }
        return false;
    }

    IsStatNamePresent(statName) {
        const statNameElements = this.GetStatNameElements();
        for (let statNameElement of statNameElements) {
            if (statNameElement.innerText.includes(statName)) {
                return true;
            }
        }
        return false;
    }

    Start() {
        this.#Background();
    }
}

class Main {
    #InstanceNumber = 0;
    #URL = "";
    #InventoryObject = undefined;

    constructor() {
        // Implement this class as a singleton.
        if (Main._instance) {
            return Main._instance;
        } else {
            Main._instance = this;
        }
    }

    GetInstance() {
        return Main._instance;
    }

    GetInstanceNumber() {
        return this.GetInstance().#InstanceNumber;
    }

    GetTabUrl() {
        return window.location.href;
    }

    IncrementInstanceNumber() {
        this.GetInstance().#InstanceNumber++;
    }

    IsInventoryPage() {
        let tabUrl = this.GetTabUrl();
        return tabUrl.includes("d2/inventory") ?? false;
        // https://app.destinyitemmanager.com/*/d2/inventory
    }

    Start() {
        this.IncrementInstanceNumber();
        let instanceNumber = this.GetInstanceNumber();
        let url = this.GetTabUrl();
        if (this.IsInventoryPage()) {
            this.#InventoryObject = new Inventory();
            this.#InventoryObject.Start();
        }
        let message = `DIM Extension started; instance #${instanceNumber} in URL '${url}'.`;
        console.debug(message);
    }
}

const main = new Main();
main.Start();
