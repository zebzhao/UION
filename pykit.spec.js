/**
 * Created by zeb on 08/12/15.
 */
describe('helper basis', function() {
    it('should detect types', function() {
        expect(pykit.isObject({})).toBeTruthy();
        expect(pykit.isArray([])).toBeTruthy();
        expect(pykit.isString("")).toBeTruthy();
        expect(pykit.isUndefined(undefined)).toBeTruthy();
        expect(pykit.isDefined(0)).toBeTruthy();
    });

    it('should not detect types', function() {
        expect(pykit.isObject([])).toBeFalsy();
        expect(pykit.isArray({})).toBeFalsy();
        expect(pykit.isString(0)).toBeFalsy();
        expect(pykit.isFunction({})).toBeFalsy();
        expect(pykit.isUndefined(null)).toBeFalsy();
        expect(pykit.isDefined(undefined)).toBeFalsy();
    });

    it('should extend and default', function() {
        var original = {a: 1};
        expect(pykit.defaults(original, {a: 0, b: 1})).toEqual({a:1, b:1});
        expect(original).toEqual({a:1, b:1});
        expect(pykit.extend(original, {a: 1, b: 2})).toEqual({a:1, b:2});
        expect(original).toEqual({a:1, b:2});
    });

    it('should default properly', function() {
        var original = {a: 0, b: undefined};
        pykit.defaults(original, {a: 10, b: 11});
        expect(original).toEqual({a: 0, b:11});
    });

    it('should pluck values', function() {
        var original = [{a:1}, {a:2}, {a:3}];
        expect(pykit.pluck(original, 'a')).toEqual([1, 2, 3]);
    });

    it('should get unique id', function() {
        expect(pykit.UI.uid()).not.toEqual(pykit.UI.uid());
        expect(pykit.uid()).not.toEqual(pykit.uid());
    });
});

describe('dispatcher', function() {
    var Dispatcher = pykit.class({__name__: "dispatcherTest"}, [pykit.Dispatcher]);
    var dispatcher = new Dispatcher({});
    var handlers = {
        fireWithArgs: function() {}
    };

    it('should fire listeners', function() {
        spyOn(handlers, 'fireWithArgs');
        dispatcher.addListener('onTestArgs', handlers.fireWithArgs);
        dispatcher.dispatch('onTestArgs', [1, 2, 3]);
        expect(handlers.fireWithArgs).toHaveBeenCalledWith(1, 2, 3);
    });

});

describe('class system', function() {
    var base1 = {
        __name__: "base1",
        __check__: function(bases) {
        },
        __init__: function() {
            this.init1 = 1;
            this.init2 = 2;
        },
        __after__: function() {
            this.init1 += 1;
            this.init2 += 1;
        },
        func1: function() {
        }
    };
    var ebase1 = pykit.defUI({__name__: "ebase1", efunc1: function() {name: "ebase1"}}, base1);
    var eebase1 = pykit.defUI({__name__: "eebase1", init1: 0}, ebase1);

    it('should call checks', function() {
        spyOn(base1, "__check__");
        expect(base1.__check__).not.toHaveBeenCalled();
        var inst1 = pykit.defUI({__name__: "test"}, base1);
        expect(base1.__check__).toHaveBeenCalled();
    });

    it('should extend from base 1', function() {
        var inst1 = new ebase1({});
        expect(inst1.func1).toBeDefined();
        expect(inst1.init1).toBe(2);
        expect(inst1.init2).toBe(3);
        expect(inst1.__base__).toEqual(["base1"]);
    });

    it('should extend from ebase 1', function() {
        var einst1 = new eebase1({instance1: 1});
        expect(einst1.func1).toBeDefined();
        expect(einst1.init1).toBeDefined(1);
        expect(einst1.init2).toBeDefined(3);
        expect(einst1.__base__).toEqual(["ebase1", "base1"]);
    });
});

describe('list', function() {
    var master = pykit.list();

    it('should take arguments', function() {
        var i = pykit.list([1, 2, 3]);
        expect(i.length).toBe(3);
    });

    it('should have iter methods', function() {
        var j = pykit.list([1,2,3]);
        expect(j.each(function(v, i) {return v})).toEqual([1, 2, 3]);
        expect(j.each(function(v, i) {return this[i]})).toEqual([1, 2, 3]);
        j.remap(function(v) {return v*2});
        expect(j.each(function(v) {return v})).toEqual([2, 4, 6]);
    });

    it('should insert at i', function() {
        master.insertAt(-10, "yes");
        expect(master.indexOf("yes")).toBe(0);
        master.insertAt(10, "no");
        expect(master.indexOf("no")).toBe(1);
        master.insertAt(1, "maybe");
        expect(master.indexOf("maybe")).toBe(1);
    });

    it('should remove at i', function() {
        master.remove("maybe");
        expect(master[0]).toBe("yes");
        expect(master[1]).toBe("no");
        master.removeAt(1);
        expect(master.length).toBe(1);
        expect(master.removeAt(master.length)).toBeFalsy();
    });

    it('should find things', function() {
        master.push({id: "a"});
        master.push({id: "b"});
        master.push({id: "a"});
        expect(master.findWhere('id', 'a').length).toEqual(2);
        expect(master.indexWhere('id', 'a')).toEqual([1, 3]);
        master.removeWhere('id', 'a');
        expect(master.findWhere('id', 'a').length).toEqual(0);
    });

    it('should remove one thing', function() {
        var value = {id: "c"};
        expect(master.contains(value)).toBeFalsy();
        master.push(value);
        expect(master.contains(value)).toBeTruthy();
        master.removeOne('id', 'c');
        expect(function() {
            master.removeOne('id', 'c')
        }).toThrow();
    });

    it('should replace one thing', function() {
        var value = {id: "d"};
        var newValue = {id: "r"};
        master.push(value);
        master.replace(value, newValue);
        expect(master.contains(newValue)).toBeTruthy();
    });

    it('should find one thing', function() {
        master.push({id: "a"});
        master.push({id: "a"});
        expect(master.findOne('id', 'a').id).toBe('a');
        master.removeWhere('id', 'a');
    });

    it('should iterate until', function() {
        var list = pykit.list([1, 2, 3]);
        var operator = {func: function() {return true;}};
        spyOn(operator, 'func').and.callThrough();
        list.until(operator.func);
        expect(operator.func.calls.count()).toBe(3);
    });
});

describe('html', function() {
    var node = document.body;
    it('should add and remove css', function() {
        pykit.html.addCSS(node, "s1");
        expect(node.className).toEqual("s1");
        pykit.html.addCSS(node, "s1", true);
        expect(node.className).toEqual("s1");
        pykit.html.addCSS(node, "s2", true);
        expect(node.className).toEqual("s1 s2");
        pykit.html.removeCSS(node, "s1");
        pykit.html.removeCSS(node, "s2");
        expect(node.className).toEqual("");
    })
});

describe('element', function() {
    it('should set properties', function() {
        spyOn(pykit.UI.element.prototype.$setters, 'hidden');
        expect(pykit.UI.element.prototype.$setters.hidden).not.toHaveBeenCalled();
        var elem = pykit.UI({view: 'element', hidden: true});
        expect(pykit.UI.element.prototype.$setters.hidden).toHaveBeenCalled();
    });

    it('should not allow duplicates', function() {
        pykit.UI({view: 'element', hidden: true, id: "repeated-id"}, document.body);
        expect(function() {
            pykit.UI({view: 'element', hidden: true, id: "repeated-id"});
        }).toThrow();
    });

    it('should dispatch render event', function() {
        var on = {onInitialized: {}};
        spyOn(on, "onInitialized");
        var ui = pykit.UI({view: 'element', hidden: true,  on: on});
        expect(ui._eventsByName.onInitialized).toBeDefined();
        expect(on.onInitialized.calls.count()).toBe(1);
    });
});

describe('flexgrid', function() {
});

describe('linked-list', function() {
    var n1 = {}, n2 = {}, n3 = {};
    var List = pykit.class({__name__: "test-linked-list"}, [pykit.LinkedList, pykit.Dispatcher]);
    var list = new List({});

    function echo(obj) {
        return obj;
    }

    it('should insert in order', function() {
        list.add(n1);
        list.add(n2);
        list.add(n3);
        expect(n1.$tailNode).toBe(n2);
        expect(list.headNode).toBe(n1);
        expect(list.tailNode).toBe(n3);
    });

    it('should insert before', function() {
        list.remove(n1);
        expect(list.headNode).toBe(n2);
        list.insertBefore(n1, n2);
        expect(list.each(echo)).toEqual([n1, n2, n3]);
        expect(list.headNode).toBe(n1);
    });

    it('should insert after', function() {
        list.remove(n3);
        expect(list.tailNode).toBe(n2);
        list.insertAfter(n3, n2);
        expect(list.each(echo)).toEqual([n1, n2, n3]);
        expect(list.tailNode).toBe(n3);
    });

    it('should find last', function() {
        expect(list.findLast(function (o) {
            return o == n1 || o == n3
        }, n1)).toBe(n1);
        expect(list.findLast(function () {
            return true
        }, n1)).toBe(n3);
    });

    it('should find first', function() {
        expect(list.findFirst(function (o) {
            return o == n1
        }, n1)).toBe(n1);
        expect(list.findFirst(function (o) {
            return o == n3
        }, n1)).toBe(n3);
    });

    it('should should be functional after clearAll', function() {
        list.clearAll();
        expect(list.headNode).toBeFalsy();
        expect(list.tailNode).toBeFalsy();
        list.add(n1);
        list.add(n3);
        expect(list.findFirst(function () {
            return true
        })).toBe(n1);
        expect(list.findLast(function () {
            return true
        })).toBe(n3);
    });

    it('should should be able to fetch by id', function() {
        n1.id = "1";
        n3.id = 1;
        expect(list.findOne('id', 1)).toBe(n3);
    });
});

describe('tree', function() {
    var elem = pykit.UI({id: "t12", view: 'tree', data: [
        {id:'root', label: 'Root'},
        {label:'Parent', $parent:'root', id:'parent'},
        {id:'child-a', label:'Child-A', $parent:'parent'},
        {id:'child-c', label:'Child-C', $parent:'parent'},
        {id:'child-b', label:'Child-B', $parent:'parent'},
        {label:'Subchild-A-A', $parent:'child-a'}
    ]}, document.body);

    it('should create branched structure', function() {
        var root = elem.getItem('root');
        var parent = elem.getItem('parent');
        expect(root.$children).toBeDefined();
        expect(parent.$depth).toBe(1);
        expect(root.$tailNode).toBe(parent);
    });

    it('should create html comp properly', function() {
        expect(elem.element.childElementCount).toBe(elem.config.data.length);
        expect(elem.element.parentElement).toBe(document.body);
    });

    it('should sort alphabetically', function() {
        expect(elem.each(function(o) {return o.label})).toEqual(
            ['Root', 'Parent', 'Child-A', 'Subchild-A-A', 'Child-B', 'Child-C']);
    });

    it('should move child-b, child-c to child-a', function() {
        var parent = elem.getItem('parent');
        var childA = elem.getItem('child-a');
        var childB = elem.getItem('child-b');
        var childC = elem.getItem('child-c');
        expect(parent.$children.length).toBe(3);
        expect(childA.$children.length).toBe(1);
        // Move child-c and child-b to child-a
        elem.updateItem(childB, {$parent: 'child-a'});
        elem.updateItem(childC, {$parent: 'child-a'});
        expect(parent.$children.length).toBe(1);
        expect(childA.$children.length).toBe(3);
        // Move them back
        elem.updateItem(childB, {$parent: 'parent'});
        elem.updateItem(childC, {$parent: 'parent'});
        expect(parent.$children.length).toBe(3);
        expect(childA.$children.length).toBe(1);
    });

    it('should remove all children under branch', function() {
        var tree = pykit.UI({
            id: "t1", view: 'tree', data: [
                {id: 'root', label: 'Root'},
                {id: 'parent', label: 'Parent', $parent: 'root'},
                {id: 'child-a', label: 'Child-A', $parent: 'parent'},
                {id: 'child-b', label: 'Child-B', $parent: 'parent'}
            ]
        }, document.body);
        var parent = tree.getItem('parent');
        expect(parent.$children.length).toBe(2);
        expect(tree.count()).toBe(4);
        tree.remove(parent);
        expect(tree.count()).toBe(1);
        expect(tree.each(function(o) {return o.label})).toEqual(['Root']);
    });
});

describe('list-ui', function() {
    var elem = pykit.UI({id: "l12", view: 'list', data: [
        {id:'lroot', label: 'Root'},
        {label:'Parent', $parent:'lroot', id:'lparent'},
        {label:'Child', $parent:'lparent'},
        {label:'Test', $parent:'lparent'}
    ]}, document.body);

    it('should create html comp properly', function() {
        expect(elem.element.childElementCount).toBe(4);
        expect(elem.element.parentElement).toBe(document.body);
    });

    it('should not change order after update', function() {
        expect(elem.headNode.label).toBe("Root");
        elem.updateItem(elem.headNode, {label: "Nice"});
        expect(elem.headNode.label).toBe("Nice");
    });
});

describe('selectors', function() {
    it('should select out property', function() {
        var obj = {a: {b: {c: 1}}};
        expect(pykit.selectors.property('a')(obj)).toEqual({b: {c: 1}});
        expect(pykit.selectors.property('a.b')(obj)).toEqual({c: 1});
        expect(pykit.selectors.property('a.b.c')(obj)).toEqual(1);
    })
});

describe('form', function() {
    var elem = pykit.UI({
        view: 'form',
        fieldset: [
            {
                formLabel: "Name",
                view: "input", name: "name"
            },
            {
                formLabel: "Speed",
                view: "input", type: "number", name: "speed",
            },
            {
                formLabel: "Loop", view: "input", type: "checkbox", name: "loop", checked: true
            }]
        }
    );

    it('should get and set values', function() {
        expect(elem.getValues()).toEqual({name: "", speed: "", loop: true});
        elem.setValues({loop: false, speed: 100, name: "Awesome"});
        expect(elem.getValues()).toEqual({name: "Awesome", speed: '100', loop: false});
    });
});