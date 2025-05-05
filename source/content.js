//------------------------------------------------------------------------------
// Item-Scoring Browser Extension for Destiny Item Manager web app
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
//------------------------------------------------------------------------------


/**
 * Gives names to some of the grid control's zero-based column indices.
 * Zero is the leftmost column.
 */
class NamedColumnIndex {
    /** Leftmost column.  Hidden.  One column left of the rowheaders. */
    static MYSTERY = 0;
    /** First user-visible column.  The rowheaders (row labels). */
    static ROWHEADER = 1;
    /** First item column. */
    static FIRSTITEM = 2;
}

/**
 * Base class to represent HTML elements added to the DOM by this extension.
 */
class ScoreExtensionElementFactory {
    /**
     * A class name that's easy for `document.getElementsByClassName()` to find
     * and represents any HTML elements added to the DOM by this extension.
     */
    static DeleteMeSentinelClass = "scoreExtension";

    /**
     * The string presented to the user when this HTML element is rendered.
     */
    #Text = "";

    /**
     * The string the user sees when hoving over the text.
     */
    #Tooltip = "";

    /**
     * An HTML DOM element that represents an instance of this class.
     */
    HtmlElement = undefined;

    constructor() {
        // If not already done, specify an appearance for the sentinel class.
        const existingStyles = document.getElementsByTagName("style");
        const existingSentinelStyleElements = Array.from(existingStyles)
            .filter((existingStyle) => existingStyle.className
                .includes(ScoreExtensionElementFactory.DeleteMeSentinelClass));

        if (existingSentinelStyleElements.length == 0) {
            const newStyleElement = document.createElement("style");
            let className = ScoreExtensionElementFactory.DeleteMeSentinelClass;
            newStyleElement.classList.add(className);

            // DEBUG: draw a red border around them.
            newStyleElement.textContent = `.${className} {background-color: #224;}`;

            // Add the new style sheet to the document.
            document.head.appendChild(newStyleElement);
        }
    }

    /**
     * @returns An HTML element that represents a score-extension object.
     *          The caller is responsible for adding it to the DOM.
     */
    CreateElement() {
        // Derived classes are expected to initialize #TagName to non-blank.
        const tagName = this.GetTagName();
        console.assert(tagName && tagName.length > 0);

        // Mark this element with the deleteme sentinel.
        let newElement = document.createElement(tagName);
        newElement.classList.add(ScoreExtensionElementFactory.DeleteMeSentinelClass);

        // Derived classes are expected to add content to the element.
        return newElement;
    }

    /**
     * Removes all ScoreExtensionElements from the DOM.
     * Useful for preparing to insert new ones to replace the old ones.
     */
    static DeleteAllElements() {
        // Delete the rows that were inserted into the Compare Items grid by this extension.
        {
            // Figure out which rows were inserted into the grid by this extension.
            const firstItemElements = ItemColumns.GetElementsInColumn(1);
            let rowIndicesToDelete = [];
            let rowIndex = 0;
            for (let element of firstItemElements) {
                if (element.className.includes(this.DeleteMeSentinelClass)) {
                    rowIndicesToDelete.push(rowIndex);
                }
                rowIndex++;
            }

            // Remove those rows from the grid.
            const grid = new CompareItemGrid();
            for (let rowIndexToDelete of rowIndicesToDelete) {
                grid.DeleteRow(rowIndexToDelete);
            }
        }

        // Delete the remaining HTML DOM elements on the page inserted by this extension.
        {
            const elementsToRemove = document.getElementsByClassName(this.DeleteMeSentinelClass);

            // Warning: Attempting to remove items as you iterate over them will fail.
            // Clone the collection first.
            const elementsArray = Array.from(elementsToRemove);
            for (let elementToRemove of elementsArray) {
                elementToRemove.remove();
            }
        }
    }

    /**
     * @returns The HTML tag name that will be returned by ToElement().
     */
    GetTagName() {
        throw new Error("Implement this in a derived class.");
    }

    /**
     * @returns The user-visible text inside this HTML element.
     */
    GetText() {
        return (this.HtmlElement)
            ? this.HtmlElement.textContent
            : this.#Text;
    }

    /**
     * @returns The user-visible tooltip when hovering over this HTML element.
     */
    GetTooltip() {
        return (this.HtmlElement)
            ? this.HtmlElement.children[0].title
            : this.#Tooltip;
    }

    /**
     * @param {string} newText The new user-visible text for this HTML element.
     */
    SetText(newText) {
        if (this.HtmlElement) {
            let textElement = this.HtmlElement.children[0];
            if (textElement.children.length > 0) {
                textElement = textElement.children[0];
            }
            textElement.textContent = newText;
        } else {
            this.#Text = newText;
        }
    }

    /**
     * @param {string} newText The new user-visible tooltip when hovering over this HTML element.
     */
    SetTooltip(newText) {
        if (this.HtmlElement) {
            let textElement = this.HtmlElement.children[0];
            if (textElement.children.length > 0) {
                textElement = textElement.children[0];
            }
            textElement.title = newText;
        } else {
            this.#Tooltip = newText;
        }

    }
}

/**
 * A derived class to represent a role="cell" HTML element.
 */
class CellFactory extends ScoreExtensionElementFactory {
    static #InnerClass = "K9b835Dp ZPndn63a";
    static #InnerSpanClass = "w4YWF699 ZPndn63a";
    static #OuterClass = "";
    static #RoleName = "cell";

    constructor(textOrCellElement) {
        super();
        switch (typeof textOrCellElement) {
            case "string":
                // Treat the argument as a label.
                this.SetText(textOrCellElement);
                break;
            case "undefined":
                // Caller omitted the argument.
                // Use a default value.
                this.SetText("(cell)"); // DEBUG
                break;
            default:
                // Clone an existing cell element.
                this.FromCellElement(textOrCellElement);
        }
    }

    /**
     * @returns An HTML element with role="cell".
     *          The caller is responsible for adding it to the DOM.
     */
    CreateElement() {
        const div = super.CreateElement();
        div.className = (div.className + " " + CellFactory.#OuterClass).trim();
        div.role = CellFactory.#RoleName;
        const innerDiv = document.createElement("div");
        innerDiv.className = CellFactory.#InnerClass;
        const innerSpan = document.createElement("span");
        innerSpan.className = CellFactory.#InnerSpanClass;
        innerSpan.textContent = this.GetText();
        innerDiv.appendChild(innerSpan);
        div.appendChild(innerDiv);
        return div;
    }

    /**
     * Initializes this instance of CellFactory with information from an existing HTMLElement.
     * @param {HTMLElement} cellElement An HTMLElement with role="cell".
     * @returns True if the HTMLElement is a valid role="cell" element.
     */
    FromCellElement(cellElement) {
        if (!CellFactory.IsCellElement(cellElement)) {
            return false;
        }

        this.HtmlElement = cellElement;
        return true;
    }

    /**
     * @returns The tag name of this HTMLElement.
     */
    GetTagName() {
        return "div";
    }

    /**
     * @param {HTMLElement} cellElement The HTMLElement to be tested.
     * @returns True if the HTMLElement is a valid role="cell".
     */
    static IsCellElement(cellElement) {
        if (!cellElement) {
            return false;
        }

        let isElement = true;

        isElement &&= (cellElement.tagName.toLowerCase() == new CellFactory().GetTagName().toLowerCase());
        isElement &&= (cellElement.role === CellFactory.#RoleName);
        isElement &&= (cellElement.children.length > 0);

        const innerDivs = cellElement.getElementsByTagName("div");
        if (innerDivs && innerDivs.length == 1) {
            const innerDiv = innerDivs[0];
            isElement &&= (innerDiv.className.includes(CellFactory.#InnerClass));
            const innerSpans = innerDiv.getElementsByTagName("span");
            if (innerSpans && innerSpans.length == 1) {
                const innerSpan = innerSpans[0];
                isElement &&= (innerSpan.className.includes(CellFactory.#InnerSpanClass));
            } else {
                isElement = false;
            }
        } else {
            isElement = false;
        }

        return isElement;
    }
}

/**
 * A derived class to represent a role="rowheader" HTML element.
 */
class RowHeaderFactory extends ScoreExtensionElementFactory {
    static #AriaSortDefault = "none";
    static #InnerClass = "m2lQ4gru ZPndn63a";
    static #OuterClass = "DCOw81Gt ZPndn63a";
    static #RoleName = "rowheader";

    constructor(labelOrRowHeaderElement) {
        super();
        switch (typeof (labelOrRowHeaderElement)) {
            case "string":
                // Treat the argument as a label.
                this.SetText(labelOrRowHeaderElement);
                break;
            case "undefined":
                // Caller omitted the argument.
                // Use a default value.
                this.SetText("(rowheader)"); // DEBUG
                break;
            default:
                // Clone an existing rowheader element.
                this.FromRowHeaderElement(labelOrRowHeaderElement);
        }
    }

    /**
     * @returns An HTML element with role="rowheader".
     *          The caller is responsible for adding it to the DOM.
     */
    CreateElement() {
        const div = super.CreateElement();
        div.className = (div.className + " " + RowHeaderFactory.#OuterClass).trim();
        div.role = RowHeaderFactory.#RoleName;
        div["aria-sort"] = RowHeaderFactory.#AriaSortDefault;
        const innerDiv = document.createElement("div");
        innerDiv.className = RowHeaderFactory.#InnerClass;
        innerDiv.textContent = this.GetText();
        div.appendChild(innerDiv);
        return div;
    }

    /**
     * Initializes this instance of RowHeaderFactory with information from an existing HTMLElement.
     * @param {HTMLElement} cellElement An HTMLElement with role="rowheader".
     * @returns True if the HTMLElement is a valid role="rowheader" element.
     */
    FromRowHeaderElement(rowHeaderElement) {
        if (!RowHeaderFactory.IsRowHeaderElement(rowHeaderElement)) {
            return false;
        }

        this.HtmlElement = rowHeaderElement;
        return true;
    }

    /**
     * @returns An array of cell="rowheader" elements.
     */
    static GetRowHeadersInContainer() {
        const gridElement = CompareItemGrid.GetGridElement();
        console.assert(gridElement);

        let rowHeaderishElements = gridElement
            .getElementsByClassName(RowHeaderFactory.#OuterClass);
        console.assert(rowHeaderishElements);
        console.assert(rowHeaderishElements.length > 0);

        // Not all items with #OuterClass have role == "rowheader".
        let rowHeaderArray = Array.from(rowHeaderishElements).filter(
            (element) => element.role === RowHeaderFactory.#RoleName);
        return rowHeaderArray;
    }

    /**
     * @returns The tag name of this HTMLElement.
     */
    GetTagName() {
        return "div";
    }

    /**
     * @param {HTMLElement} rowHeaderElement The HTMLElement to be tested.
     * @returns True if the HTMLElement is a valid role="rowheader".
     */
    static IsRowHeaderElement(rowHeaderElement) {
        if (!rowHeaderElement) {
            return false;
        }

        let isElement = true;

        isElement &&= (rowHeaderElement.tagName.toLowerCase() == new RowHeaderFactory().GetTagName().toLowerCase());
        isElement &&= (rowHeaderElement.className.includes(RowHeaderFactory.#OuterClass));
        isElement &&= (rowHeaderElement.children.length > 0);

        const innerDivs = rowHeaderElement.getElementsByTagName("div");
        if (innerDivs && innerDivs.length == 1) {
            const innerDiv = innerDivs[0];
            isElement &&= (innerDiv.className.includes(this.#InnerClass));
        } else {
            isElement = false;
        }

        return isElement;
    }
}

/**
 * Provides functionality related to the DOM representing the items being
 * compared in the Compare Items UI.
 */
class ItemColumns {
    static #ItemColumnHeaderElementClassName = "GsGjKjzr";
    static #LastColumnElementClassName = "iNpTFYHY";

    /**
     * @param {number} columnNumber - The one-based number of the item in the comparer.
     * @returns {number} The number of cells (item properties) in the given column.
     */
    static GetCellCount(columnNumber) {
        const cellElements = ItemColumns.GetCellsInColumn(columnNumber);
        return cellElements.length;
    }

    /**
     * @param {number} columnNumber - The one-based number of the item in the comparer.
     * @returns An array of elements with role="cell" in the given column.
     */
    static GetCellsInColumn(columnNumber) {
        const columnElements = ItemColumns.GetElementsInColumn(columnNumber);
        const cellElements = columnElements.filter((element) => element.role === "cell");
        console.assert(cellElements !== undefined);
        console.assert(Array.isArray(cellElements));
        return cellElements;
    }

    /**
     * @param {number} columnNumber - The one-baesd item number.
     * @returns the element in the top row of the given item's column.
     */
    static GetColumnHeaderElement(columnNumber) {
        console.assert(columnNumber > 0, columnNumber);
        const elements = document.getElementsByClassName(ItemColumns.#ItemColumnHeaderElementClassName);
        const elementCount = elements.length;
        console.assert(columnNumber < elementCount, columnNumber, elementCount);
        return elements[columnNumber - 1];
    }

    /**
     * @param {number} columnNumber  The one-based number of the item in the comparer.
     * @returns An array of elements in the given column, including the column header.
     */
    static GetElementsInColumn(columnNumber) {
        const headerElement = ItemColumns.GetColumnHeaderElement(columnNumber);
        let columnElements = [];
        let cursor = headerElement;
        while (cursor.className !== this.#LastColumnElementClassName) {
            columnElements.push(cursor);
            cursor = cursor.nextElementSibling;
        }
        console.assert(columnElements !== undefined);
        console.assert(Array.isArray(columnElements));
        return columnElements;
    }

    /**
     * @returns The number of items being compared.
     */
    static GetItemCount() {
        const elements = document.getElementsByClassName(
            ItemColumns.#ItemColumnHeaderElementClassName);
        console.assert(elements !== undefined);
        const elementCount = elements.length;
        return elementCount;
    }
}

/**
 * For working with the data in the "Compare Items" UI.
 */
class CompareItemGrid {
    #ClassName = "O_nrJOk_";
    #ItemColumnHeaderElementClassName = "GsGjKjzr";
    #MysteryColumnHeaderClassName = "FaRhIQRI DCOw81Gt ZPndn63a";
    #RowheaderColumnHeaderClassName = this.#MysteryColumnHeaderClassName;
    #MysteryColumnClassName = "hPOfsorL";

    /**
     * Adds an element to the mystery column to the left of the rowheader column.
     * @param {number} newRowIndex The row at which the new element will be inserted.
     */
    #AddMysteryRowElement(newRowIndex) {
        const firstMysteryColumnElement = this.GetFirstElementInColumn(NamedColumnIndex.MYSTERY);

        // Find the element in the mystery column at the specified row.
        let cursor = firstMysteryColumnElement;
        let skipCount = newRowIndex;
        while (skipCount > 0) {
            cursor = cursor.nextElementSibling;
            skipCount--;
        }
        console.assert(cursor);

        // Clone that element and decorate it to make it easy to remove later.
        const mysteryColumnParent = cursor.parentElement;
        const oldMysteryColumnElement = cursor;
        const newMysteryColumnElement = cursor.cloneNode(true);
        newMysteryColumnElement.classList.add(ScoreExtensionElementFactory.DeleteMeSentinelClass);
        mysteryColumnParent.insertBefore(newMysteryColumnElement, oldMysteryColumnElement);
    }

    /**
     * After calling DeclareNewRow(), adds the new row to each column of the grid.
     * @param {number} newRowIndex Where the new row will be inserted.
     * @param {string?} placeholderValue The value the user sees in those columns.
     */
    #AddPlaceholderRowElements(newRowIndex, placeholderValue = "placeholder") {
        // Create and initialize the new rowheader.
        const newRowHeader = new RowHeaderFactory(placeholderValue);
        const newRowHeaderElement = newRowHeader.CreateElement();

        // Find the rowheader at newRowIndex.
        // Column zero is a mystery column.
        // Column one is the rowheader column.
        // Columns greater than one are the items being compared.
        const oldRowHeaderElement = this.GetGridCellElement(NamedColumnIndex.ROWHEADER, newRowIndex);
        console.assert(RowHeaderFactory.IsRowHeaderElement(oldRowHeaderElement));

        // Insert the new rowheader above the old rowheader.
        const rowHeaderParent = oldRowHeaderElement.parentElement;
        rowHeaderParent.insertBefore(newRowHeaderElement, oldRowHeaderElement);

        // Initialize the remaining cells of this row.
        const itemCount = this.GetItemCount();
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            // Create and initialize the new cell.
            const newCell = new CellFactory(placeholderValue);
            const newCellElement = newCell.CreateElement();

            // Find the cell to push down.
            const columnIndex = itemIndex + NamedColumnIndex.FIRSTITEM;
            const oldCellElement = this.GetGridCellElement(columnIndex, newRowIndex);
            console.assert(CellFactory.IsCellElement(oldCellElement), oldCellElement);

            // Insert the new cell above the old cell.
            const cellParent = oldCellElement.parentElement;
            cellParent.insertBefore(newCellElement, oldCellElement);
        }
    }

    /** Insert an empty row into the grid where the rowIndexth row is,
     *  initialize each column in the new row to the given placeholder value.
     * 
     * @param {number} newRowIndex Which 0-based row to push down to make room for a new row of data.
     * @param {string} newRowLabel What to name this row (a string to initialize column 0 of the new row with).
     * @param {string?} newRowTemplate What template applies to this new row.
     *                  Defaults to cloning the template of the displaced row.
     * @param {string} placeholderValue What value to give to each new non-label cell in that row.
     *                 Defaults to "placeholder".
     */
    AddRow(newRowIndex, newRowLabel, newRowTemplate, placeholderValue = "placeholder") {
        // Validate preconditions.
        const gridElement = this.GetGridElement();
        if (!gridElement.style.hasOwnProperty("grid-template-rows")) {
            throw new Error(`The grid element doesn't have a 'grid-template-rows' style property.`);
        }

        let rowTemplatesString = gridElement.style["grid-template-rows"];
        let rowTemplatesArray = rowTemplatesString.split(" ");
        let rowsPerColumn = rowTemplatesArray.length;

        // Validate inputs.
        if (newRowIndex < 0) {
            throw new Error(`newRowIndex (${newRowIndex}) < 0`);
        }
        if (newRowIndex >= rowsPerColumn) {
            // The new row should be created after the last row of this column.
            newRowIndex = rowsPerColumn;
        }
        if (!newRowTemplate) {
            // Clone the existing template unless overridden by the caller.
            newRowTemplate = rowTemplatesArray[newRowIndex];
        }

        // Tell the grid control to expect a new row.
        this.#DeclareNewRow(newRowIndex);

        // Add and initialize the elements of that new row in the grid.
        this.#InitializeEmptyRow(newRowIndex);
    }

    /**
     * Update the grid's expectation of how many rows it has by adding one.
     * @param {number} newRowIndex Where the new row will be inserted.
     * @param {string?} newRowTemplate What template that row should use.
     *                                 Defaults to cloning the existing template at that row.
     */
    #DeclareNewRow(newRowIndex, newRowTemplate) {
        console.assert(newRowIndex >= 0, `newRowIndex (${newRowIndex}) must be zero or greater.`);

        // Assumption: The number of rows is driven by the number of tokens in
        // the "grid-template-rows" style property of the grid element.
        const gridElement = this.GetGridElement();
        console.assert(gridElement);
        console.assert(gridElement.style.hasOwnProperty("grid-template-rows"));
        let rowTemplatesString = gridElement.style["grid-template-rows"];
        let rowTemplatesArray = rowTemplatesString.split(" ");
        let rowsPerColumn = rowTemplatesArray.length;
        console.assert(rowsPerColumn > 0);

        // Assumption: All rowTemplate names are identical, so clone one of them
        // if the caller didn't specify a template name.
        newRowTemplate ??= rowTemplatesArray[0];

        // Insert the new template name into the array of templates at the specified index.
        rowTemplatesArray.splice(newRowIndex, 0, newRowTemplate);
        let newRowsPerColumn = rowTemplatesArray.length;
        console.assert(newRowsPerColumn - rowsPerColumn == 1, "A new row wasn't added correctly.");

        // Apply the updated template list to the grid's row definition.
        const newRowTemplatesString = rowTemplatesArray.join(" ");
        gridElement.style["grid-template-rows"] = newRowTemplatesString;
    }

    /**
     * Removes the elmeent at the specified row from each column of the grid.
     * @param {number} oldRowIndex Zero-based index of the row to remove from the grid.
     */
    DeleteRow(oldRowIndex) {
        // Remove the element at the specified row index from each column.
        const columnCount = this.GetColumnCount();
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            const firstElementInColumn = this.GetFirstElementInColumn(columnIndex);
            let skipCount = oldRowIndex;
            let cursor = firstElementInColumn;
            while (skipCount > 0) {
                cursor = cursor.nextElementSibling;
                skipCount--;
            }
            console.assert(cursor);
            if (cursor.className.includes(ScoreExtensionElementFactory.DeleteMeSentinelClass)) {
                // Don't delete DIM's DOM objects!
                cursor.remove();
            }
        }

        // Update the grid control's expectation of how many rows it has.
        // Warning: Do this after deleting content from the grid so that
        //          the grid's former row count can be calculated correctly.
        this.#UndeclareRow(oldRowIndex);
    }

    /**
     * @returns The total number of columns in the grid.
     *          Includes the mystery, rowheader, and item columns.
     */
    GetColumnCount() {
        const itemCount = this.GetItemCount();

        // Account for the mystery column and the rowheader column.
        return itemCount + 2;
    }

    /**
     * @param {number} columnIndex Zero-based index into the grid's columns.
     *                        @see NamedColumnIndex
     * @returns The first HTML DOM element in the given column.
     */
    GetFirstElementInColumn(columnIndex) {
        console.assert(columnIndex >= 0, columnIndex);
        switch (columnIndex) {
            case 0: // Mystery column.
                return document.getElementsByClassName(this.#MysteryColumnHeaderClassName)[columnIndex];
            case 1: // Rowheader column.
                return document.getElementsByClassName(this.#RowheaderColumnHeaderClassName)[columnIndex];
            default:
                // Item columns.
                const itemNumber = columnIndex - NamedColumnIndex.FIRSTITEM;
                return document.getElementsByClassName(this.#ItemColumnHeaderElementClassName)[itemNumber];
        }
    }

    /**
     * @param {number} colIndex Which column (0 = leftmost) of the grid.
     * @param {number} rowIndex Which row (0 = topmost) of the grid.
     * 
     * @returns 
     * The HTML element at the specified coordinates within the grid.
     */
    GetGridCellElement(colIndex, rowIndex) {
        // Assumption:  The contents (cells) of the grid are represented by a
        // flat list of HTML elements that are divided into columns when
        // rendering.
        const rowsPerColumn = this.GetRowCount();
        console.assert(rowIndex < rowsPerColumn, rowIndex, rowsPerColumn);
        let skipCount = colIndex * rowsPerColumn + rowIndex;
        if (colIndex >= NamedColumnIndex.FIRSTITEM) {
            // Account for the column-separator element that appears
            // after each item being compared, which has class "iNpTFYHY".
            skipCount += (colIndex - NamedColumnIndex.FIRSTITEM);
        }
        let cursor = this.GetGridElement().children[0];
        while (skipCount > 0) {
            cursor = cursor.nextElementSibling;
            skipCount--;
        }
        return cursor;
    }

    /**
     * @returns The HTML element in the DOM that represents the grid control.
     */
    static GetGridElement() {
        const compareItemGrid = new CompareItemGrid();
        const gridElement = compareItemGrid.GetGridElement();
        return gridElement;
    }

    /**
     * @returns The HTML element in the DOM that represents the grid control.
     */
    GetGridElement() {
        const gridElements = document.getElementsByClassName(this.#ClassName);
        console.assert(gridElements);
        console.assert(gridElements.length > 0);
        return gridElements[0];
    }

    /**
     * @returns How many items are being compared.
     */
    GetItemCount() {
        const itemColumnElements = document.getElementsByClassName(this.#ItemColumnHeaderElementClassName);
        return itemColumnElements.length;
    }

    /**
     * @returns The number of rows per column as declared by the style property
     * 'grid-template-rows' of the grid element.
     */
    GetRowCount() {
        const gridElement = this.GetGridElement();
        if (gridElement.style.hasOwnProperty("grid-template-rows")) {
            const gridTemplateRowData = gridElement.style["grid-template-rows"];
            const rowCount = gridTemplateRowData.split(" ").length;
            return rowCount;
        }
        return 0;
    }

    /**
     * After calling #DeclareNewRow(), adds the new row to each column of the grid.
     * @param {number} newRowIndex Where the new row will be inserted.
     * @param {string?} placeholderValue The value the user sees in those columns.
     */
    #InitializeEmptyRow(newRowIndex, placeholderValue = "placeholder") {
        // Add a new row to the mystery column.
        this.#AddMysteryRowElement(newRowIndex);

        // Add the new cells to the other columns of this row.
        this.#AddPlaceholderRowElements(newRowIndex, placeholderValue);
    }

    /**
     * Update the grid's expectation of how many rows it has by subtracting one.
     * @param {number} oldRowIndex Which row will be removed.
     */
    #UndeclareRow(oldRowIndex) {
        console.assert(oldRowIndex >= 0, `newRowIndex (${oldRowIndex}) must be zero or greater.`);

        // Assumption: The number of rows is driven by the number of tokens in
        // the "grid-template-rows" style property of the grid element.
        const gridElement = this.GetGridElement();
        console.assert(gridElement);
        console.assert(gridElement.style.hasOwnProperty("grid-template-rows", gridElement.style));
        let rowTemplatesString = gridElement.style["grid-template-rows"];
        let rowTemplatesArray = rowTemplatesString.split(" ");
        let oldRowsPerColumn = rowTemplatesArray.length;
        console.assert(oldRowsPerColumn > 0, oldRowsPerColumn);
        console.assert(oldRowIndex < oldRowsPerColumn, oldRowIndex, oldRowsPerColumn);

        // Remove the template name that represents the row to be removed.
        rowTemplatesArray.splice(oldRowIndex, 1);

        // Verify that the array of templates (rows) has decreased by one.
        let newRowsPerColumn = rowTemplatesArray.length;
        console.assert(oldRowsPerColumn - newRowsPerColumn == 1, oldRowsPerColumn, newRowsPerColumn);

        // Apply the updated template list to the grid's row definition.
        const newRowTemplatesString = rowTemplatesArray.join(" ");
        gridElement.style["grid-template-rows"] = newRowTemplatesString;
    }
}

/**
 * Provides functionality that interacts with the Compare Items UI.
 */
class Inventory {
    #DrawerClassName = "C09jLGoT";
    #CompareDrawerParentElementId = "temp-container";
    #ScoreNameElementClass = "scoreName";
    #ScoreValueElementClass = "scoreValue";
    #StatNameElementClass = "mcdkY1aj";
    #StatValueElementClass = "K9b835Dp";
    #SortDecreasingClass = "sjSbUvMJ";
    #SortIncreasingClass = "r0eY0kZ5";
    #DpsStatName = "DPM";
    #RpmStatName = "RPM";
    #CompareItemGrid = new CompareItemGrid();

    /**
     * The background thread that periodically updates the Compare Items UI.
     */
    #Background() {
        let now = new Date().toLocaleString();
        console.debug(`${now}: #Background.`);
        this.#UpdateItemComparer();
        setTimeout(() => this.#Background(), 2000);
    }

    /**
     * Updates the Compare Items UI whenever supported item types are present.
     */
    #UpdateItemComparer() {
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
    }

    /**
     * @param {string} scoreStatName The name of the stat to write the score to.
     * @param {Object[]} scoringStats The array of stats to calculate the score from.
     * @param {string} scoringStats[].name The name of a stat that contributes to an item's score.
     * @param {string} scoringStats[].operator Whether the stat increases ("*") or decreases ("/") the score.
     * @param {string[]} requiredItemTypes Array of one or more item types that have the stats named by scoringStats.
     * @returns True if the score stat could be calculated and published to the HTML successfully.
     */
    AddScoreStat(scoreStatName, scoringStats, requiredItemTypes) {
        if (!scoreStatName) {
            console.error("Please specify the stat (row name) where the score will be published, e.g. 'my score'.");
            return false;
        }
        if (!scoringStats || scoringStats.length < 1) {
            console.error("Please specify one or more stat names paired with whether they appear on the numerator ('*') or denominator ('/'), e.g. [{stat: 'Charge Time', operator: '/'}, {stat: 'Impact', operator: '*'}, ...].");
            return false;
        }
        if (!requiredItemTypes) {
            console.error("Please specify one or more compatible item item types, e.g. ['Fusion Rifle', 'Linear Fusion Rifle'].");
            return false;
        }
        if (!this.IsCompareDrawerOpen()) {
            // console.debug("Item comparer is not open.");
            return false;
        }
        if (this.#CompareItemGrid.GetItemCount() == 1) {
            // console.debug(`There are too few items to compare.`);
            return false;
        }

        // Check for unsupported item type.
        const itemTypeName = this.GetItemTypeName();
        if (!requiredItemTypes.includes(itemTypeName)) {
            // let itemTypesString = requiredItemTypes
            //     .map((e) => `'${e}'`) // Wrap each element in quotes.
            //     .reduce((a, b) => `${a}, ${b}`); // Create a CSV from the elements.
            // console.debug(`The comparer contains items of type '${itemType}', which is not in [${itemTypesString}].`);
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
            console.warn(`The required stat name '${missingStatName}' was not found in the comparer for '${itemName}' (${itemTypeName}).`);
            return false;
        }

        // Remove all of this extension's HTML elements that were previously
        // added, and update the compare grid's height accordingly.
        ScoreExtensionElementFactory.DeleteAllElements();

        // Insert an empty row to report the score stat for each item.
        // Apply the score stat's name to label the row.
        const gridElement = new CompareItemGrid();
        const scoreStatRowIndex = 2;
        gridElement.AddRow(scoreStatRowIndex, scoreStatName);

        // Populate the other columns of the new row.

        // Set rowheader (row title).
        {
            if (!this.IsStatNamePresent(scoreStatName)) {
                const statNameElement = this.#CompareItemGrid.GetGridCellElement(
                    NamedColumnIndex.ROWHEADER,
                    scoreStatRowIndex);
                const rowHeaderFactory = new RowHeaderFactory(statNameElement);
                rowHeaderFactory.SetText(scoreStatName);

                // Set the tooltip of the row header to the score's formula.
                /**
                 * @param {Object[]} scoringStats The array of stats to calculate the score from.
                 * @param {string} scoringStats[].name The name of a stat that contributes to an item's score.
                 * @param {string} scoringStats[].operator Whether the stat increases ("*") or decreases ("/") the score.
                 * @returns a human-readable string explaining how the score is calculated.
                 */
                function GetFormulaString(scoringStats) {
                    // 
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
                    return scoringFormula;
                }

                const formula = GetFormulaString(scoringStats);
                rowHeaderFactory.SetTooltip(formula);
            }
        }

        // Set item score values.
        {
            const itemCount = ItemColumns.GetItemCount();
            for (let itemNumber = 1; itemNumber <= itemCount; itemNumber++) {
                const itemScore = this.CalculateScore(itemNumber, scoringStats);

                // Update the item's score placeholder value with its newly calculated value.
                const scoreValueElement = this.GetItemStatValueElementByName(itemNumber, scoreStatName);
                const scoreValue = new CellFactory(scoreValueElement);
                console.assert(scoreValue);
                scoreValue.SetText(itemScore);
            }
        }

        // Normalize the scores.
        {
            // Get an array of scores.
            const scoreCells = this.GetScoreCells(scoreStatName);
            console.assert(Array.isArray(scoreCells), scoreCells);

            // Calculate the maximum score.
            const scores = [];
            for (let scoreCell of scoreCells) {
                const score = Number(scoreCell.GetText());
                console.assert(!Number.isNaN(score), score);
                scores.push(score);
            }

            let maxScore = scores.reduce((a, b) => a > b ? a : b);

            // Recalculate each score relative to the maximum score.
            for (let scoreCell of scoreCells) {
                const score = Number(scoreCell.GetText());
                console.assert(!Number.isNaN(score), score);
                const normalizedScore = (Number(score) / maxScore).toFixed(3);
                scoreCell.SetText(normalizedScore);
            }
        }

        // Color the score values.
        {
            // Get an array of normalized scores.
            const scoreCells = this.GetScoreCells(scoreStatName);
            console.assert(Array.isArray(scoreCells), scoreCells);

            // Look up the color for each normalized score and apply it.
            for (let scoreCell of scoreCells) {
                const normalizedScore = Number(scoreCell.GetText());
                const itemScoreElement = scoreCell.HtmlElement;
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
        }

        return true;
    }

    /**
     * @param {string} scoreStatName The name of the stat to write the score to.
     * @param {Object[]} scoringStats The array of stats to calculate the score from.
     * @param {string} scoringStats[].name The name of a stat that contributes to an item's score.
     * @param {string} scoringStats[].operator Whether the stat increases ("*") or decreases ("/") the score.
     * @returns True if the score stat row could be published to the HTML successfully (with placeholder values).
     */
    AddColumnValues(scoreStatName, scoringStats) {
        let itemCount = ItemColumns.GetItemCount();

        // Delete all existing score stats so that a new value can be calcualted and inserted.
        // Useful when the collection of items being compared changes.
        let existingItemScoreStatElements = document.getElementsByClassName(this.#ScoreValueElementClass);
        for (let existingItemScoreStatElement of existingItemScoreStatElements) {
            existingItemScoreStatElement.remove();
        }

        // Calculate a new score stat for each item being compared.
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            // Insert the score stat as a placeholder before calculating its value
            // so that GetItemStatValueByName() will look in the correct row for
            // the named stat.

            const scoreStatIndex = this.GetStatNameIndex(scoreStatName);
            const existingStatValueElement = this.GetGridElement(itemIndex, scoreStatIndex);

            // Create and insert a placeholder score stat element and calculate its value later.
            const newScoreStatValueElement
                = this.CreateItemStatValueElementContainer(0 /* placeholder value */);
            const newlyAddedScoreStatElement = existingStatValueElement.parentElement
                .insertBefore(newScoreStatValueElement, existingStatValueElement);

        }
        return true;
    }

    /**
     * @param {number} itemNumber The one-based number of the item being compared.
     * @param {Object[]} scoringStats The array of stats to calculate the score from.
     * @param {string} scoringStats[].name The name of a stat that contributes to an item's score.
     * @param {string} scoringStats[].operator Whether the stat increases ("*") or decreases ("/") the score.
     * @returns The item's score calculated from its stats.
     */
    CalculateScore(itemNumber, scoringStats) {
        let numerator = 1;
        let denominator = 1;

        // Modify the numerator and denominator according to each stat's contribution.
        for (let scoringStat of scoringStats) {
            let statName = scoringStat.name;
            let statOperator = scoringStat.operator;
            let statValue = this.GetItemStatValueByName(itemNumber, statName);
            switch (statOperator) {
                case '*':
                    // This stat's value contributes to the numerator.
                    numerator *= isNaN(statValue) ? 1 : (statValue == 0) ? 1 : statValue;
                    if (numerator == 0) {
                        const itemName = this.GetItemName(itemNumber);
                        console.warn(`Unexpectedly zero numerator for '${statName}' in '${itemName}'.`);
                    }
                    break;
                case '/':
                    // This stat's value contributes to the denominator.
                    denominator *= isNaN(statValue) ? 1 : (statValue == 0) ? 1 : statValue;
                    if (denominator == 0) {
                        const itemName = this.GetItemName(itemNumber);
                        console.error(`Unexpectedly zero denominator for '${statName}' in '${itemName}'.`);
                    }
                    break;
                default:
                    console.warn(`Unsupported operator '${statOperator}' for '${statName}' in '${itemName}'.`);
            }
        }

        // Calculate the item's score as a ratio.
        const itemScore = (numerator / denominator).toFixed(3);
        return itemScore;
    }

    /**
     * @param {number} itemStatValue The value to encapsulate.
     * @returns A new HTMLElement that contains the given stat value.
     */
    CreateItemStatValueElementContainer(itemStatValue) {
        const existingStatValueElements = document.getElementsByClassName(this.#StatValueElementClass);
        const exampleStatValueElement = existingStatValueElements[2]; // [0] is "Power" which doesn't match other stats.
        const exampleStatValueElementContainer = exampleStatValueElement.parentElement; // Stat value elements are wrapped.
        const newStatValueElementContainer = exampleStatValueElementContainer.cloneNode(true);
        newStatValueElementContainer.classList.add(this.#ScoreValueElementClass);
        const newStatValueElement = newStatValueElementContainer.getElementsByTagName("span");
        newStatValueElement.textContent = itemStatValue;
        return newStatValueElementContainer;
    }

    /**
     * @param {HTMLElement} statValueElementContainer An HTMLElement that contains a stat value element.
     * @param {number} newStatValue The new value to be stored in that element.
     */
    UpdateItemStatValueElement(statValueElementContainer, newStatValue) {
        const statValueSpan = statValueElementContainer.getElementsByTagName("span")[0];
        console.assert(statValueSpan);
        statValueSpan.textContent = newStatValue;
    }

    /**
     * @returns The HTMLElement that represents the Compare Items UI.
     */
    GetDrawerElement() {
        const elements = document.body.getElementsByClassName(this.#DrawerClassName);
        return elements.length > 0 ? elements[0] : undefined;
    }

    /**
     * @param {number} colIndex The zero-based column number of the Compare Items grid to access.
     * @param {number|string} rowIndexOrName The zero-based row number or rowheader name of the grid to access.
     * @returns The HTMLElement at the given row and column of the Compare Items grid.
     */
    GetGridElement(colIndex, rowIndexOrName) {
        const compareGridElement = document.getElementsByClassName("O_nrJOk_")[0];
        if (compareGridElement.length == 0) {
            console.error("Compare drawer isn't open.");
            return undefined;
        }

        const rowHeaderElements = Array
            .from(compareGridElement.getElementsByClassName("DCOw81Gt ZPndn63a"))
            .filter((item) => (typeof (item.role) !== "undefined") && (item.role == "rowheader"));
        const rowCount = rowHeaderElements.length;
        const statNames = rowHeaderElements.map((item) => item.textContent);
        const itemNameElements = compareGridElement.getElementsByClassName("compare-findable");
        const itemCount = itemNameElements.length;

        // Validate rowIndexOrName.
        let rowIndex = -1;
        let statName = undefined;
        switch (typeof (rowIndexOrName)) {
            case "string":
                statName = rowIndexOrName;
                rowIndex = statNames.indexOf(statName);
                if (rowIndex == -1) {
                    console.error(`Stat bane '${rowIndexOrName}' is not found.`);
                    return undefined;
                }
                break;
            case "number":
                if (rowIndexOrName < 0) {
                    console.error(`rowIndex (${rowIndexOrName}) < 0`);
                    return undefined;
                }
                if (rowIndexOrName > rowCount) {
                    console.error(`rowIndex (${rowIndexOrName}) > rowCount (${rowCount})`);
                    return undefined;
                }
                rowIndex = rowIndexOrName;
                statName = statNames[rowIndex];
                break;
            default:
                console.error(`rowIndexOrName (${rowIndexOrName}) is not supported.`);
                return;
        }

        // Validate colIndex.
        if (colIndex < 0) {
            // There is no item with that number.
            console.error(`colIndex (${colIndex}) < 0`);
            return undefined;
        } else if (colIndex == 0) {
            // The caller wants a stat name (row header) element.
            return rowHeaderElements[rowIndex];
        } else if (colIndex > itemCount) {
            // There is no item with that number.
            console.error(`colIndex (${colIndex}) > itemCount (${itemCount})`);
            return undefined;
        } else {
            // The caller wants a stat value specified by rowIndexOrName
            // from the colIndexth item.
            const itemNameElement = itemNameElements[colIndex];
            let index = 0;
            for (let element = itemNameElement;
                element.role == "cell" && element.className !== "iNpTFYHY";
                element = element.nextElementSibling) {
                // Walk down the cells until the rowIndexth.
                if (index == rowIndex) {
                    return element;
                }
                index++;
            }

            // We've gone too far.
            console.error(`index (${index}) > rowIndex (${rowIndex})`);
            return undefined;
        }

        console.error("Execution not expcted to reach here.");
        return undefined;
    }

    /**
     * @returns A name for the type of weapon being compared, or undefined if
     *          the comparer isn't open.
     *          Examples: "Auto Rifle", "Combat Bow", "Grenade Launcher".
     */
    GetItemTypeName() {
        if (!this.IsCompareDrawerOpen()) {
            // console.debug("Item comparer is not open.");
            return undefined;
        } else {
            // console.debug("Item comparer is open.");
        }

        const firstItemColumnHeaderElement = ItemColumns.GetColumnHeaderElement(1);
        const itemTokens = firstItemColumnHeaderElement.children[1].children[0].title.split("\n");
        // const itemName = itemTokens[0];
        const itemTypeName = itemTokens[1];
        return itemTypeName;
    }

    /**
     * @param {number} itemNumber The one-based number of the item being compared.
     * @returns The name of the item being compared, where itemNumber is a natural number.
     */
    GetItemName(itemNumber) {
        console.assert(itemNumber > 0, `itemNumber (${itemNumber}) < 1; item numbers begin with 1.`);
        const itemName = this.GetItemStatValueByName(itemNumber, "Name");
        return itemName;
    }

    /**
     * @param {number} itemNumber The one-based number of the item whose stat value should be returned.
     * @param {number} statIndex The zero-based number of the stat whose value should be returned.
     * @returns The value of the stat specified by the arguments.
     */
    GetItemStatValue(itemNumber, statIndex) {
        console.assert(itemNumber > 0, `itemNumber (${itemNumber}) < 1; item numbers begin with 1.`);
        const statValueElement = this.GetItemStatValueElement(itemNumber, statIndex);
        const statValue = statValueElement?.textContent ?? "0";
        const zeroIfNanStatValue = isNaN(statValue) ? 0 : statValue;
        return zeroIfNanStatValue;
    }

    /**
     * @param {number} itemNumber The one-based number of the item whose stat value should be returned.
     * @param {string} statName The name of the stat to be returned.
     * @returns The value of the stat specified by the arguments.
     */
    GetItemStatValueByName(itemNumber, statName) {
        console.assert(itemNumber > 0, `itemNumber (${itemNumber}) < 1; item numbers begin with 1.`);
        const statIndex = this.GetStatNameIndex(statName);
        return this.GetItemStatValue(itemNumber, statIndex);
    }

    /**
     * @param {number} itemNumber The one-based number of the item whose stat value should be returned.
     * @param {number} statIndex The zero-based number of the stat whose value should be returned.
     * @returns The HTMLElement containing the stat specified by the arguments.
     */
    GetItemStatValueElement(itemNumber, statIndex) {
        console.assert(itemNumber > 0, `itemNumber (${itemNumber}) < 1; item numbers begin with 1.`);
        const itemIndex = itemNumber - 1 + NamedColumnIndex.FIRSTITEM;
        const statValueElement = this.#CompareItemGrid.GetGridCellElement(itemIndex, statIndex);
        return statValueElement;
    }

    /**
     * @param {number} itemNumber The one-based number of the item whose stat value should be returned.
     * @param {string} statName The name of the stat to be returned.
     * @returns The HTMLElement containing the stat specified by the arguments.
     */
    GetItemStatValueElementByName(itemNumber, statName) {
        console.assert(itemNumber > 0, `itemNumber (${itemNumber}) < 1; item numbers begin with 1.`);
        const statIndex = this.GetStatNameIndex(statName);
        const itemIndex = itemNumber - 1 + NamedColumnIndex.FIRSTITEM;
        const statValueElement = this.#CompareItemGrid.GetGridCellElement(itemIndex, statIndex);
        return statValueElement;
    }

    /**
     * @param {string} scoreStatName The name of the score stat.
     * @returns An array of CellFactory, one per item.  Each element of the array represnts a score stat.
     */
    GetScoreCells(scoreStatName) {
        const itemCount = ItemColumns.GetItemCount();
        const scoreCells = [];
        for (let itemNumber = 1; itemNumber <= itemCount; itemNumber++) {
            const scoreValueElement = this.GetItemStatValueElementByName(itemNumber, scoreStatName);
            console.assert(scoreValueElement);
            const scoreValue = new CellFactory(scoreValueElement);
            console.assert(scoreValue);
            scoreCells.push(scoreValue);
        }
        return scoreCells;
    }

    /**
     * @returns Array of HTMLElements that contain stat names.
     */
    GetStatNameElements() {
        const compareGridElement = this.#CompareItemGrid.GetGridElement();
        const rowHeaderElements = Array
            .from(compareGridElement.getElementsByClassName("DCOw81Gt ZPndn63a"))
            .filter((item) => (typeof (item.role) !== "undefined") && (item.role == "rowheader"));
        return rowHeaderElements;
    }

    /**
     * @param {string} statName The name of a stat.
     * @returns The row index of that stat, counting from the column header element, otherwise -1.
     */
    GetStatNameIndex(statName) {
        console.assert(statName && statName.length > 0);
        const firstRowHeaderColumnElement = this.#CompareItemGrid.GetGridCellElement(NamedColumnIndex.ROWHEADER, 0);
        let trimmedStatName = statName.trim();
        let cursor = firstRowHeaderColumnElement;
        let rowCount = this.#CompareItemGrid.GetRowCount();
        let rowIndex = 0;
        while (rowIndex < rowCount) {
            const cursorObject = new RowHeaderFactory(cursor);
            console.assert(cursorObject, cursor.outerHTML);
            const trimmedCursorStatName = cursorObject.GetText().trim();
            if (trimmedCursorStatName === trimmedStatName) {
                break;
            }
            rowIndex++;
            cursor = cursor.nextElementSibling;
        }
        // Return -1 if the stat name was not found in the rowheader column.
        return rowIndex == rowCount ? -1 : rowIndex;
    }

    /**
     * @returns True if the Compare Items UI is visible to the user.
     */
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

    /**
     * @returns True if the Infuse Items UI is visible to the user.
     */
    IsInfuseDrawerOpen() {
        const drawerElement = this.GetDrawerElement();
        if (drawerElement) {
            const isCompareDrawer = drawerElement
                .textContent
                .toLowerCase()
                .includes("select item to infuse");
            return isCompareDrawer;
        }
        return false;
    }

    /**
     * @param {string} statName The name of the stat.
     * @returns True if the given name is among the stats shown to the user.
     */
    IsStatNamePresent(statName) {
        const statNameElements = this.GetStatNameElements();
        for (let statNameElement of statNameElements) {
            if (statNameElement.innerText.includes(statName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Start monitoring the page for the Compare Items UI.
     */
    Start() {
        this.#Background();
    }
}

/**
 * The class that executes the logic of this extension.
 */
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

    /**
     * @returns True if the browser is on the Inventory page.
     */
    IsInventoryPage() {
        let tabUrl = this.GetTabUrl();
        return tabUrl.includes("d2/inventory") ?? false;
        // https://app.destinyitemmanager.com/*/d2/inventory
    }

    /**
     * Starts this extension's logic.
     */
    Start() {
        console.debug("Main.Start() start.");
        this.IncrementInstanceNumber();
        let instanceNumber = this.GetInstanceNumber();
        let url = this.GetTabUrl();
        if (this.IsInventoryPage()) {
            this.#InventoryObject = new Inventory();
            this.#InventoryObject.Start();
        }
        let message = `DIM Extension started; instance #${instanceNumber} in URL '${url}'.`;
        console.debug(message);
        console.debug("Main.Start() end.");
    }
}

const main = new Main();
main.Start();
