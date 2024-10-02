const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('userInput');

// Questions and options
const questions = [
    {
        question: "Wollen Sie überhaupt auf der Fläche aktiv eingreifen oder überlassen Sie die Fläche der natürlichen Sukzession? Dies ist auch abhängig von den vorhandenen finanziellen Mitteln.",
        options: ["Aktiv wiederbewalden", "Natürliche Sukzession"],
        type: "single"
    },
    {
        question: "Handelt es sich bei der Fläche um ein FFH Gebiet?",
        options: ["Ja", "Nein"],
        type: "single"
    },
    {
        question: "Wollen Sie vornehmlich mit Laub- oder Nadelholz wiederbewalden?",
        options: ["Laubholz", "Nadelholz", "Gleichmäßig Gemischt"],
        type: "single"
    },
    {
        question: "Besteht Naturverjüngung auf der Fläche?",
        options: ["Ja", "Nein"],
        type: "single"
    },
    {
        question: "Welche Baumarten wachsen durch Naturverjüngung auf der Fläche? (Eiche, Buche, Fichte Spruce, ...)",
        type: "text" // Free text input
    },
    {
        question: "Gibt es Baumarten, die Sie auf jeden Fall auf der Fläche pflanzen wollen?",
        type: "text" // Free text input
    },
    {
        question: "Gibt es Baumarten, die Sie nicht auf der Fläche haben wollen?",
        type: "text" // Free text input
    },
    {
        question: "Gibt es auf Ihrer Fläche Reh- oder Rotwild? (Sie können mehrere Optionen auswählen und fortfahren, indem Sie fertig sind, indem Sie auf die Schaltfläche „Nächste“ klicken.)",
        options: ["Rehwild", "Rotwild", "Niederwild"],
        type: "multiple" // Multiple choice
    },
    {
        question: "Möchten Sie für die Wiederbewaldung der Fläche Förderung beantragen (z.b. Wiederbewaldungsprämie, WET-Förderung oder Förderung „Klimaangepasster Wald“)?",
        options: ["Ja", "Nein"],
        type: "single"
    },
    {
        question: "Bitte gehen Sie auf die Webseite Waldinfo.NRW und nutzen Sie das „Unterstützungssystem Wiederbewaldung“, um zu erfahren, welche Waldentwicklungstypen für Ihre Fläche geeignet sind. \nHierbei geht es nicht darum, unbedingt Förderung für die Pflanzung eines bestimmten WETs zu beantragen, noch die spezifische Zusammensetzung und Baumanteile eines WET genau einzuhalten. Die WETs beinhalten jeweils einen Katalog an Haupt- und Nebenbaumarten, aber auch eine große Vielzahl an möglichen Begleitbaumarten, und ermöglichen so einen großen Gestaltungsspielraum für Ihren Wald. Sie bieten somit Orientierung bezüglich der Möglichkeiten auf einer bestimmten Fläche. \nWelche WET werden Ihnen für die Zielfläche von Waldinfo.NRW vorgeschlagen?",
        options: ["12", "92", "20", "14", "21", "27", "28", "29", "42", "62", "68", "69", "82", "96", "98"],
        type: "multiple" 
    },
    {
        question: "Weitere empfohlene Waldentwicklungstypen:",
        options: ["12", "92", "20", "14", "21", "27", "28", "29", "42", "62", "68", "69", "82", "96", "98"],
        type: "multiple"
    }
];

let currentQuestionIndex = 0;
let responses = [];

// Function to send a message
function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessageToChat(userMessage, 'user');
        processResponse(userMessage);
        userInput.value = '';
    }
}

// Function to handle 'Enter' key
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Function to add message to chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'user' ? 'msg test' : 'msg';
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}


// Function to show the Next button
function showNextButton() {
    const nextButton = document.createElement('button');
    nextButton.className = 'button-next';
    nextButton.textContent = 'Nächste';
    nextButton.onclick = () => {
        // For the last question, finish the chat
        if (currentQuestionIndex === questions.length - 1) {
            finishChat();
        } else {
            currentQuestionIndex++;
            askNextQuestion();
        }
        nextButton.remove(); // Remove the next button
    };
    chatBox.appendChild(nextButton);
}


// Function to ask the next question
function askNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        const questionElement = document.createElement('div');
        questionElement.className = 'msg';
        questionElement.textContent = currentQuestion.question;

        // If options are provided
        if (currentQuestion.options) {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            currentQuestion.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.className = 'opt';
                optionButton.textContent = option;
                optionButton.onclick = () => {
                    addMessageToChat(option, 'user');
                    processResponse(option); // Process response when option is selected
                };
                optionsContainer.appendChild(optionButton);
            });
            questionElement.appendChild(optionsContainer);
        } else {
            // For text inputs
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.placeholder = 'Geben Sie hier Ihre Antwort ein..';
            textInput.onkeypress = (event) => {
                if (event.key === 'Enter') {
                    addMessageToChat(textInput.value, 'user');
                    processResponse(textInput.value);
                }
            };
            questionElement.appendChild(textInput);
        }

        chatBox.appendChild(questionElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }
}


// Function to generate PDF with the selected responses
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Waldplanungsassistent - Antworten', 10, 10);
    let y = 20;

    // Function to add text with line wrapping and dynamic positioning
    const addTextWithWrapping = (text, isBold = false, isItalic = false) => {
        const wrappedText = doc.splitTextToSize(text, 190); // Width considering margins
        wrappedText.forEach((line) => {
            if (y > 270) { // If y exceeds the bottom of the page
                doc.addPage();
                y = 10; // Reset y position for the new page
            }
            if (isBold) {
                doc.setFont("helvetica", "bold");
            } else if (isItalic) {
                doc.setFont("helvetica", "italic");
            } else {
                doc.setFont("helvetica", "normal");
            }
            doc.text(line, 10, y);
            y += 10; // Increment y for the next line
        });
        return y; // Return new y position
    };

    // Forest Management Preferences (Question 1-3)
    doc.setFontSize(12);
    y = addTextWithWrapping("1. Präferenzen der Waldbewirtschaftung", true);
    y = addTextWithWrapping(`Antwort: ${responses[0]}`); // Response for Forest Management

    y = addTextWithWrapping("Weitere Informationen zu den Auswahlmöglichkeiten:");

    // Summaries
    const activeReforestationSummary = 
        "Aktive Wiederaufforstung: Bei der aktiven Wiederaufforstung greift der Mensch ein, um Bäume in degradierten Gebieten zu pflanzen und zu pflegen. Dieser Ansatz fördert die Artenvielfalt, verbessert die Ökosystemleistungen und mildert den Klimawandel durch die schnelle Wiederherstellung von Lebensräumen.";

    const naturalSuccessionSummary = 
        "Natürliche Sukzession: Natürliche Sukzession ist der allmähliche Prozess der Veränderung und Entwicklung von Ökosystemen ohne menschliches Eingreifen. Sie ermöglicht die natürliche Erholung von Vegetation und Lebensräumen, aber der Zeitrahmen für eine signifikante Erholung kann stark variieren, was sie zu einem langsameren Ansatz als die aktive Wiederaufforstung macht.";

    // Adding summaries in italics
    y = addTextWithWrapping(activeReforestationSummary, false, true);
    y = addTextWithWrapping(naturalSuccessionSummary, false, true);
    y += 10; //Add some extra space

    // Ecological Considerations (FFH and Natural Regeneration)
    y = addTextWithWrapping("2. Ökologische Überlegungen", true);
    y = addTextWithWrapping(`FFH-Gebiet: ${responses[1]}`); // Response for FFH Area
    y = addTextWithWrapping(`Baumart: ${responses[2]}`); // Response for Natural Regeneration
    y = addTextWithWrapping(`Natürliche Regeneration: ${responses[3]}`); // Response for Natural Regeneration
    
    const ecologicalSummary = 
        "Diese Bewertung bietet einen Überblick über die für Ihr Gebiet geeigneten Waldbewirtschaftungsstrategien und berücksichtigt dabei wichtige Faktoren wie die Frage, ob das Land als FFH-Gebiet ausgewiesen ist, die bevorzugte Aufforstungsmethode (aktive Wiederaufforstung oder natürliche Sukzession) und das Vorhandensein natürlicher Regeneration. Das Verständnis dieser Elemente ermöglicht es den Beteiligten, fundierte Entscheidungen über geeignete Waldbewirtschaftungspraktiken zu treffen und so nachhaltige Forstwirtschaft und Naturschutzbemühungen in der Region zu unterstützen.";
    
    y = addTextWithWrapping(ecologicalSummary, false, true);
    y += 10; 

    // Tree Species and Wildlife Preferences
    y = addTextWithWrapping("3. Baumarten und Wildtierpräferenzen", true);
    y = addTextWithWrapping(`Arten natürlicher Entstehung: ${responses[4]}`); // Response for Species to Plant
    y = addTextWithWrapping(`Obligatorische Arten: ${responses[5]}`); // Response for Unwanted Species
    y = addTextWithWrapping(`Unerwünschte Arten: ${responses[6]}`); // Response for Wildlife
    
    const selectedWETs3 = Array.isArray(responses[7]) ? responses[7].join(", ") : responses[7]; // Join selected WETs with commas
    y = addTextWithWrapping(`Wildtiere vor Ort: ${selectedWETs3}`);
    
    const speciesSummary = 
        "Bei der Bewertung werden die Baumarten untersucht, die sich in dem Gebiet natürlich regenerieren, sowie die Arten, die angepflanzt werden sollen und jene, die vermieden werden sollten. Darüber hinaus wird das Vorkommen von Rehen oder anderen Wildtieren berücksichtigt, das die Waldbewirtschaftungsstrategien beeinflussen kann. Diese Informationen sind entscheidend für die Erstellung eines umfassenden Waldbewirtschaftungsplans, der mit den Zielen der Artenvielfalt, der Gesundheit des Ökosystems und spezifischen forstwirtschaftlichen Zielen in Einklang steht.";
    
    y = addTextWithWrapping(speciesSummary, false, true);
    y += 10; 

    // Funding and Support
    y = addTextWithWrapping("4. Finanzierung und Unterstützung", true);
    y = addTextWithWrapping(`Finanzierungspräferenz: ${responses[8]}`); // Response for Funding

    const fundingSummary = 
        "Diese Anfrage befasst sich mit dem Interesse an der Beantragung von Fördermitteln zur Unterstützung der Wiederaufforstung des Gebiets, einschließlich verschiedener verfügbarer Programme wie Wiederaufforstungsprämien, WET-Fördermittel oder Anreize für klimaangepasste Forstwirtschaftspraktiken. Die Prüfung von Finanzierungsmöglichkeiten ist von wesentlicher Bedeutung, um eine nachhaltige Waldbewirtschaftung zu ermöglichen und finanzielle Mittel für Wiederaufforstungsinitiativen sicherzustellen.";
    
    y = addTextWithWrapping(fundingSummary, false, true);
    y += 10; 

    // Suitable Forest Development Types (WET)
    y = addTextWithWrapping("5. Nachhaltige Waldentwicklungstypen (WET)", true);

    // Display the selected WETs (from the last question)
    y = addTextWithWrapping("Besonders empfohlene Waldentwicklungstypen:", true);
    const selectedWETs1 = Array.isArray(responses[9]) ? responses[9].join(", ") : responses[9]; // Join selected WETs with commas
    y = addTextWithWrapping(`WET Type: ${selectedWETs1}`);

    y = addTextWithWrapping("Weitere empfohlene Waldentwicklungstypen:", true);
    const selectedWETs2 = Array.isArray(responses[10]) ? responses[10].join(", ") : responses[10]; // Join selected WETs with commas
    y = addTextWithWrapping(`WET Type: ${selectedWETs2}`);

    // Custom summary for WET selection
    const WETSelectionSummary = 
        "Die Aufforderung führt Sie dazu, die Website Waldinfo.NRW zu besuchen und das „Wiederaufforstungsunterstützungssystem“ zu nutzen, um geeignete Waldentwicklungstypen (WET) für Ihre Region zu finden. Nachdem Sie die Empfehlungen Ihres Ansprechpartners überprüft haben, können Sie auf der Website weitere detaillierte Informationen zu den identifizierten Waldentwicklungstypen finden. Die empfohlenen Typen umfassen eine Auswahl aus verschiedenen Kategorien, sodass Sie fundierte Entscheidungen über Wiederaufforstungsstrategien treffen können, die auf Ihre spezifischen Bedürfnisse zugeschnitten sind.";
    
    y = addTextWithWrapping(WETSelectionSummary, false, true);
    y += 10; 

    // Save the PDF
    doc.save('forest_planning_responses.pdf');
}



//  Function to process user response and move to the next question
function processResponse(userMessage) {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        
        // Only move to the next question for single and text types
        if (currentQuestion.type === "single" || currentQuestion.type === "text") {
            responses.push(userMessage);
            currentQuestionIndex++;
            askNextQuestion();
        } else if (currentQuestion.type === "multiple") {
            // Initialize the response array if it doesn't exist
            if (!responses[currentQuestionIndex]) {
                responses[currentQuestionIndex] = []; // Initialize as an array
            }

            // Toggle selection of the option
            if (responses[currentQuestionIndex].includes(userMessage)) {
                responses[currentQuestionIndex] = responses[currentQuestionIndex].filter(item => item !== userMessage); // Deselect if already selected
            } else {
                responses[currentQuestionIndex].push(userMessage); // Add selected option
            }
            // Show next button after selecting options
            showNextButton();
        }
        else{
            finishChat();
        }
    } 
    
    
}

// Function to finish the chat and show responses
function finishChat() {
    const thankYouMessage = document.createElement('div');
    thankYouMessage.className = 'msg';
    thankYouMessage.textContent = "Vielen Dank für Ihre Antworten!";
    chatBox.appendChild(thankYouMessage);

    // Create Print button
    const printButton = document.createElement('button');
    printButton.textContent = 'PDF der Antworten herunterladen';
    printButton.className = 'opt'; // Style it similarly to options
    printButton.onclick = generatePDF; // Set onclick to generate PDF
    chatBox.appendChild(printButton);
    
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Array to store previous selections
const previousSelections = [];

// Function to handle selection changes
function handleSelectionChange(questionIndex, selectedValue) {
    // Check if the selected value is the same as the previous selection
    if (previousSelections[questionIndex] === selectedValue) {
        alert("Sie haben die gleiche Option erneut gewählt! Bitte wählen Sie eine andere Option.");
    } else {
        // Update the previous selection
        previousSelections[questionIndex] = selectedValue;
    }
}

// Start the chat with the first question
askNextQuestion();
