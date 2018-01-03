module.exports = content => {
    let index = 0;
    let options = {};

    if (content[index] === '(') {
        let closed = false;

        let label = '';
        let option = null;
        let escaped = false;

        const hasOption = () => !!option;

        const pushOption = () => {
            if (hasOption()) {
                options[option.key] = option.value;
                option = null;
            } else {
                options[label] = true;
            }
            label = '';
        }

        console.log(content);

        while (index < content.length - 1) {
            let next = content[++index];

            if (!escaped && next === ')') {
                pushOption();
                closed = true;
                break;
            }

            if (!escaped && !hasOption() && next === '=') {
                option = { key: label, value: '' };
            } else if (!escaped && next === ';') {
                pushOption();
            } else if (!escaped && next === '\\') {
                escaped = true;
            } else {
                escaped = false;
                if (hasOption()) {
                    option.value += next;
                } else {
                    label += next;
                }
            }
        }

        if (!closed) {
            throw 'Missing closing bracket for options!';
        }
    }

    return { options, remainder: content.substr(index + 1) };
};