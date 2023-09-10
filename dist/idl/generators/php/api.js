"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHPAPIGenerator = void 0;
const schema_1 = require("../../schema");
const types_1 = require("../../types");
const generator_1 = require("../generator");
class PHPAPIGenerator extends generator_1.Generator {
    constructor() {
        super();
    }
    generateTypeGuard(type, eol) {
        let lines = [];
        if (type instanceof types_1.AnyType) {
            lines.push(`new AnyGuard()`);
        }
        else if (type instanceof types_1.ArrayType) {
            lines.push(`new ArrayGuard(`);
            lines.push(`\t${this.generateTypeGuard(type.type, eol + "\t")}`);
            lines.push(`)`);
        }
        else if (type instanceof types_1.BinaryType) {
            lines.push(`new StringGuard()`);
        }
        else if (type instanceof types_1.BooleanType) {
            lines.push(`new BooleanGuard()`);
        }
        else if (type instanceof types_1.BooleanLiteralType) {
            lines.push(`new BooleanLiteralGuard(${type.value})`);
        }
        else if (type instanceof types_1.IntegerType) {
            lines.push(`new IntegerGuard()`);
        }
        else if (type instanceof types_1.IntegerLiteralType) {
            lines.push(`new IntegerLiteralGuard(${type.value})`);
        }
        else if (type instanceof types_1.IntersectionType) {
            let bodylines = [];
            for (let subtype of type.types) {
                bodylines.push(`\t${this.generateTypeGuard(subtype, eol + "\t")}`);
            }
            let content = bodylines.length === 0 ? "" : eol + bodylines.join("," + eol) + eol;
            lines.push(`new IntersectionGuard([${content}])`);
        }
        else if (type instanceof types_1.NullType) {
            lines.push(`new NullGuard()`);
        }
        else if (type instanceof types_1.NumberType) {
            lines.push(`new NumberGuard()`);
        }
        else if (type instanceof types_1.NumberLiteralType) {
            lines.push(`new NumberLiteralGuard(${type.value})`);
        }
        else if (type instanceof types_1.ObjectType) {
            let required_lines = [];
            let optional_lines = [];
            for (let [key, member] of type.members.entries()) {
                if (member.optional) {
                    optional_lines.push(`	"${key}" => ${this.generateTypeGuard(member.type, eol + "\t")}`);
                }
                else {
                    required_lines.push(`	"${key}" => ${this.generateTypeGuard(member.type, eol + "\t")}`);
                }
            }
            let required = required_lines.length === 0 ? "" : eol + required_lines.join("," + eol) + eol;
            let optional = optional_lines.length === 0 ? "" : eol + optional_lines.join("," + eol) + eol;
            lines.push(`new ObjectGuard((object) [${required}], (object) [${optional}])`);
        }
        else if (type instanceof types_1.PlainType) {
            lines.push(`new StringGuard()`);
        }
        else if (type instanceof types_1.RecordType) {
            lines.push(`new RecordGuard(`);
            lines.push(`\t${this.generateTypeGuard(type.type, eol + "\t")}`);
            lines.push(`)`);
        }
        else if (type instanceof types_1.ReferenceType) {
            lines.push(`new ReferenceGuard(function () {`);
            lines.push(`\tglobal $${type.typename};`);
            lines.push(`\treturn $${type.typename};`);
            lines.push(`})`);
        }
        else if (type instanceof types_1.StringType) {
            lines.push(`new StringGuard()`);
        }
        else if (type instanceof types_1.StringLiteralType) {
            lines.push(`new StringLiteralGuard("${type.value}")`);
        }
        else if (type instanceof types_1.TupleType) {
            let lines = [];
            for (let subtype of type.types) {
                lines.push(`\t${this.generateTypeGuard(subtype, eol + "\t")}`);
            }
            let content = lines.length === 0 ? "" : eol + lines.join("," + eol) + eol;
            lines.push(`new TupleGuard([${content}])`);
        }
        else if (type instanceof types_1.UnionType) {
            let bodylines = [];
            for (let subtype of type.types) {
                bodylines.push(`\t${this.generateTypeGuard(subtype, eol + "\t")}`);
            }
            let content = bodylines.length === 0 ? "" : eol + bodylines.join("," + eol) + eol;
            lines.push(`new UnionGuard([${content}])`);
        }
        else if (type instanceof types_1.Options) {
            // TODO: Remove when Options is removed.
            lines.push(`new ObjectGuard((object) [], (object) [])`);
        }
        else if (type instanceof types_1.Headers) {
            // TODO: Remove when Headers is removed.
            lines.push(`new ObjectGuard((object) [], (object) [])`);
        }
        else if (type instanceof schema_1.BinaryPayloadType) {
            lines.push(`new StringGuard()`);
        }
        else {
            console.log(type);
            throw new Error(`Type not supported by generator!`);
        }
        return lines.join(eol);
    }
    generateBaseFile(schema, eol) {
        let lines = [];
        lines.push(`<?php namespace autoguard;`);
        lines.push(``);
        lines.push(`require_once(__DIR__ . "/../Autoguard.php");`);
        lines.push(``);
        for (let guard of schema.guards) {
            lines.push(`$${guard.typename} = ${this.generateTypeGuard(guard.type, eol)};`);
            lines.push(``);
        }
        lines.push(`?>`);
        lines.push(``);
        let content = lines.join(eol);
        return {
            name: "./bases/Base.php",
            content: content,
            overwrite: true
        };
    }
    generateBaseRouteFile(route, eol) {
        let name = route.alias.identifier;
        if (name === "") {
            throw new Error(`Route not supported by generator!`);
        }
        let lines = [];
        lines.push(`<?php namespace autoguard;`);
        lines.push(``);
        lines.push(`require_once(__DIR__ . "/../Autoguard.php");`);
        lines.push(`require_once(__DIR__ . "/./Base.php");`);
        lines.push(``);
        lines.push(`abstract class ${name}Base extends Route {`);
        lines.push(`	protected array $matchers;`);
        lines.push(``);
        lines.push(`	function __construct() {`);
        lines.push(`		parent::__construct();`);
        lines.push(`		$this->matchers = [];`);
        {
            for (let [index, { name, quantifier, type }] of route.path.components.entries()) {
                let { min, max } = quantifier.getMinMax();
                let plain = type == null || type instanceof types_1.PlainType;
                type = type !== null && type !== void 0 ? type : new types_1.StringLiteralType(name);
                lines.push(`		$this->matchers[${index}] = new Matcher(${min}, ${max}, ${plain}, ${this.generateTypeGuard(type, eol + "\t")});`);
            }
        }
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function accepts_components(array $components): bool {`);
        lines.push(`		return Matcher::match($components, $this->matchers);`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function accepts_method(string $method): bool {`);
        lines.push(`		return $method === "${route.method.method}";`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function accepts_accepts(array $accepts): bool {`);
        lines.push(`		return Route::accepts_content_type($accepts, "${route.response.getContentType()}");`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function prepare_request(object $request): object {`);
        for (let [index, { name, quantifier, type }] of route.request.headers.headers.entries()) {
            name = name.toLowerCase();
            let plain = type instanceof types_1.PlainType || type instanceof types_1.StringType || type instanceof types_1.StringLiteralType;
            if (quantifier.kind === "repeated") {
                throw new Error(`Quantifier not supported by generator!`);
            }
            else if (!plain) {
                lines.push(`		Route::parse_member($request->headers, $request->headers, "${name}", ${plain});`);
            }
        }
        for (let [index, { name, quantifier, type }] of route.path.components.entries()) {
            if (type != null) {
                lines.push(`		$this->matchers[${index}]->read_value($request->options, "${name}");`);
            }
        }
        for (let [index, { name, quantifier, type }] of route.parameters.parameters.entries()) {
            let plain = type instanceof types_1.PlainType;
            if (quantifier.kind === "repeated") {
                throw new Error(`Quantifier not supported by generator!`);
            }
            else {
                lines.push(`		Route::parse_member($request->options, $request->parameters, "${name}", ${plain});`);
            }
        }
        if (!(route.request.payload instanceof types_1.BinaryType)) {
            lines.push(`		$request->payload = Route::parse_json($request->payload);`);
        }
        lines.push(`		return $request;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function validate_request(object $request): object {`);
        lines.push(`		return Route::guard_request($request, ${this.generateTypeGuard((0, schema_1.getRequestType)(route), eol + "\t\t")});`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function validate_response(object $response): object {`);
        lines.push(`		return Route::guard_response($response, ${this.generateTypeGuard((0, schema_1.getResponseType)(route), eol + "\t\t")});`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function finalize_response(object $response): object {`);
        lines.push(`		$response->headers->{"content-type"} = $response->headers->{"content-type"} ?? "${route.response.getContentType()}";`);
        for (let [index, { name, quantifier, type }] of route.response.headers.headers.entries()) {
            name = name.toLowerCase();
            let plain = type instanceof types_1.PlainType || type instanceof types_1.StringType || type instanceof types_1.StringLiteralType;
            if (quantifier.kind === "repeated") {
                throw new Error(`Quantifier not supported by generator!`);
            }
            else if (!plain) {
                lines.push(`		Route::serialize_member($response->headers, $response->headers, "${name}", ${plain});`);
            }
        }
        if (!(route.response.payload instanceof types_1.BinaryType)) {
            lines.push(`		$response->payload = Route::serialize_json($response->payload);`);
        }
        lines.push(`		return $response;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`?>`);
        lines.push(``);
        let content = lines.join(eol);
        return {
            name: `./bases/${name}Base.php`,
            content: content,
            overwrite: true
        };
    }
    generateRouteFile(route, eol) {
        let name = route.alias.identifier;
        let lines = [];
        lines.push(`<?php namespace autoguard;`);
        lines.push(``);
        lines.push(`require_once(__DIR__ . "/../bases/${name}Base.php");`);
        lines.push(`require_once(__DIR__ . "/../Autoguard.php");`);
        lines.push(``);
        lines.push(`class ${name} extends ${name}Base {`);
        lines.push(`	function handle_request(object $request): object {`);
        lines.push(`		throw new HTTPException(Status::NOT_IMPLEMENTED);`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`?>`);
        lines.push(``);
        let content = lines.join(eol);
        return {
            name: `./routes/${name}.php`,
            content: content,
            overwrite: false
        };
    }
    generateHtaccessFile(eol) {
        let lines = [];
        lines.push(`RewriteEngine On`);
        lines.push(`RewriteRule . index.php [QSA,L]`);
        lines.push(``);
        let content = lines.join(eol);
        return {
            name: `./.htaccess`,
            content: content,
            overwrite: true
        };
    }
    generateAutoguardFile(eol) {
        let lines = [];
        lines.push(`<?php namespace autoguard;`);
        lines.push(``);
        lines.push(`class GuardException extends \\Exception {`);
        lines.push(`	public string $path;`);
        lines.push(`	public string $observed;`);
        lines.push(`	public string $expected;`);
        lines.push(``);
        lines.push(`	function __construct(string $path, string $observed, string $expected) {`);
        lines.push(`		parent::__construct("Expected " . $observed . " at " . $path . " to be " . $expected . "!");`);
        lines.push(`		$this->path = $path;`);
        lines.push(`		$this->observed = $observed;`);
        lines.push(`		$this->expected = $expected;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class HTTPException extends \\Exception {`);
        lines.push(`	public int $status;`);
        lines.push(``);
        lines.push(`	function __construct(int $status, ?string $message = null) {`);
        lines.push(`		parent::__construct($message);`);
        lines.push(`		$this->status = $status;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`abstract class Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	abstract function as(mixed &$subject, string $path): mixed;`);
        lines.push(``);
        lines.push(`	function is(mixed &$subject, ?string $path = ""): bool {`);
        lines.push(`		try {`);
        lines.push(`			$this->as($subject, $path);`);
        lines.push(`			return true;`);
        lines.push(`		} catch (\\Exception $exception) {`);
        lines.push(`			return false;`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function check_typename(mixed &$subject, string $path, string $expected): void {`);
        lines.push(`		$observed = mb_strtolower(gettype($subject));`);
        lines.push(`		if ($observed !== $expected) {`);
        lines.push(`			throw new GuardException($path, $observed, $expected);`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class AnyGuard extends Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class ArrayGuard extends Guard {`);
        lines.push(`	protected Guard $guard;`);
        lines.push(``);
        lines.push(`	function __construct(Guard $guard) {`);
        lines.push(`		$this->guard = $guard;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "array");`);
        lines.push(`		for ($i = 0; $i < count($subject); $i++) {`);
        lines.push(`			$this->guard->as($subject[$i], $path . "[$i]");`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class BooleanGuard extends Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "boolean");`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class BooleanLiteralGuard extends Guard {`);
        lines.push(`	protected bool $literal;`);
        lines.push(``);
        lines.push(`	function __construct(bool $literal) {`);
        lines.push(`		$this->literal = $literal;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		if ($subject !== $this->literal) {`);
        lines.push(`			throw new GuardException($path, $subject, (string) $this->literal);`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class IntegerGuard extends Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "integer");`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class IntegerLiteralGuard extends Guard {`);
        lines.push(`	protected int $literal;`);
        lines.push(``);
        lines.push(`	function __construct(int $literal) {`);
        lines.push(`		$this->literal = $literal;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		if ($subject !== $this->literal) {`);
        lines.push(`			throw new GuardException($path, $subject, (string) $this->literal);`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class IntersectionGuard extends Guard {`);
        lines.push(`	protected array $guards;`);
        lines.push(``);
        lines.push(`	function __construct(array $guards) {`);
        lines.push(`		$this->guards = $guards;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		foreach ($this->guards as $guard) {`);
        lines.push(`			$guard->as($subject, $path);`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class NullGuard extends Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "null");`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class NumberGuard extends Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "float");`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class NumberLiteralGuard extends Guard {`);
        lines.push(`	protected float $literal;`);
        lines.push(``);
        lines.push(`	function __construct(float $literal) {`);
        lines.push(`		$this->literal = $literal;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		if ($subject < $this->literal && $subject > $this->literal) {`);
        lines.push(`			throw new GuardException($path, $subject, (string) $this->literal);`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class ObjectGuard extends Guard {`);
        lines.push(`	protected object $required_guards;`);
        lines.push(`	protected object $optional_guards;`);
        lines.push(``);
        lines.push(`	function __construct(object $required_guards, object $optional_guards) {`);
        lines.push(`		$this->required_guards = $required_guards;`);
        lines.push(`		$this->optional_guards = $optional_guards;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "object");`);
        lines.push(`		foreach ($this->required_guards as $key => $guard) {`);
        lines.push(`			if (property_exists($subject, $key)) {`);
        lines.push(`				$guard->as($subject->$key, $path . ".$key");`);
        lines.push(`			} else {`);
        lines.push(`				throw new GuardException($path . ".$key", "absent member", "present");`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		foreach ($this->optional_guards as $key => $guard) {`);
        lines.push(`			if (property_exists($subject, $key)) {`);
        lines.push(`				$guard->as($subject->$key, $path . ".$key");`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class RecordGuard extends Guard {`);
        lines.push(`	protected Guard $guard;`);
        lines.push(``);
        lines.push(`	function __construct(Guard $guard) {`);
        lines.push(`		$this->guard = $guard;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "object");`);
        lines.push(`		foreach ($subject as $key => $member) {`);
        lines.push(`			$this->guard->as($member, $path . ".$key");`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class ReferenceGuard extends Guard {`);
        lines.push(`	protected \\Closure $closure;`);
        lines.push(``);
        lines.push(`	function __construct(\\Closure $closure) {`);
        lines.push(`		$this->closure = $closure;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		return $this->closure->call($this)->as($subject, $path);`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class StringGuard extends Guard {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "string");`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class StringLiteralGuard extends Guard {`);
        lines.push(`	protected string $literal;`);
        lines.push(``);
        lines.push(`	function __construct(string $literal) {`);
        lines.push(`		$this->literal = $literal;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		if ($subject !== $this->literal) {`);
        lines.push(`			throw new GuardException($path, $subject, (string) $this->literal);`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class TupleGuard extends Guard {`);
        lines.push(`	protected array $guards;`);
        lines.push(``);
        lines.push(`	function __construct(array $guards) {`);
        lines.push(`		$this->guards = $guards;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		Guard::check_typename($subject, $path, "array");`);
        lines.push(`		foreach ($this->guards as $i => $guard) {`);
        lines.push(`			if (array_key_exists($i, $subject)) {`);
        lines.push(`				$guard->as($subject[$i], $path . "[$i]");`);
        lines.push(`			} else {`);
        lines.push(`				throw new GuardException($path . "[$i]", "absent element", "present");`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		return $subject;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class UnionGuard extends Guard {`);
        lines.push(`	protected array $guards;`);
        lines.push(``);
        lines.push(`	function __construct(array $guards) {`);
        lines.push(`		$this->guards = $guards;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function as(mixed &$subject, ?string $path = ""): mixed {`);
        lines.push(`		foreach ($this->guards as $guard) {`);
        lines.push(`			try {`);
        lines.push(`				return $guard->as($subject, $path);`);
        lines.push(`			} catch (\\Exception $exception) {}`);
        lines.push(`		}`);
        lines.push(`		Guard::check_typename($subject, $path, "union");`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class Matcher {`);
        lines.push(`	protected int $min_occurences;`);
        lines.push(`	protected int $max_occurences;`);
        lines.push(`	protected bool $plain;`);
        lines.push(`	protected Guard $guard;`);
        lines.push(`	protected array $values;`);
        lines.push(``);
        lines.push(`	function __construct(int $min_occurences, int $max_occurences, bool $plain, Guard $guard) {`);
        lines.push(`		$this->min_occurences = $min_occurences;`);
        lines.push(`		$this->max_occurences = $max_occurences;`);
        lines.push(`		$this->plain = $plain;`);
        lines.push(`		$this->guard = $guard;`);
        lines.push(`		$this->values = [];`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function accept_component(string $component, bool $collect = true): bool {`);
        lines.push(`		if (count($this->values) >= $this->max_occurences) {`);
        lines.push(`			return false;`);
        lines.push(`		}`);
        lines.push(`		try {`);
        lines.push(`			$value = $this->plain ? $component : Route::parse_json($component);`);
        lines.push(`			if ($this->guard->is($value)) {`);
        lines.push(`				if ($collect) {`);
        lines.push(`					array_push($this->values, $value);`);
        lines.push(`				}`);
        lines.push(`				return true;`);
        lines.push(`			}`);
        lines.push(`		} catch (\\Exception $exception) {}`);
        lines.push(`		return false;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function accepts_component(string $component): bool {`);
        lines.push(`		return $this->accept_component($component, false);`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function read_value(object $target, string $key): void {`);
        lines.push(`		if ($this->max_occurences === 1) {`);
        lines.push(`			if (count($this->values) > 0) {`);
        lines.push(`				$target->$key = $this->values[0];`);
        lines.push(`			}`);
        lines.push(`		} else {`);
        lines.push(`			$target->$key = $this->values;`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function is_satisfied(): bool {`);
        lines.push(`		return $this->min_occurences <= count($this->values) && count($this->values) <= $this->max_occurences;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function reset(): void {`);
        lines.push(`		$this->values = [];`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function match(array $components, array $matchers): bool {`);
        lines.push(`		foreach ($matchers as $matcher) {`);
        lines.push(`			$matcher->reset();`);
        lines.push(`		}`);
        lines.push(`		$i = 0;`);
        lines.push(`		foreach ($components as $component) {`);
        lines.push(`			$accepted = false;`);
        lines.push(`			foreach (array_slice($matchers, $i) as $matcher) {`);
        lines.push(`				if ($matcher->is_satisfied()) {`);
        lines.push(`					if (!$matcher->accepts_component($component)) {`);
        lines.push(`						$i += 1;`);
        lines.push(`						continue;`);
        lines.push(`					}`);
        lines.push(`					if ($i + 1 < count($matchers)) {`);
        lines.push(`						$next_matcher = $matchers[$i + 1];`);
        lines.push(`						if ($next_matcher->accepts_component($component)) {`);
        lines.push(`							$i += 1;`);
        lines.push(`							continue;`);
        lines.push(`						}`);
        lines.push(`					}`);
        lines.push(`				}`);
        lines.push(`				if (!$matcher->accepts_component($component)) {`);
        lines.push(`					return false;`);
        lines.push(`				}`);
        lines.push(`				$matcher->accept_component($component);`);
        lines.push(`				$accepted = true;`);
        lines.push(`				break;`);
        lines.push(`			}`);
        lines.push(`			if (!$accepted) {`);
        lines.push(`				return false;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		if ($i !== count($matchers) - 1) {`);
        lines.push(`			return false;`);
        lines.push(`		}`);
        lines.push(`		if (!$matchers[$i]->is_satisfied()) {`);
        lines.push(`			return false;`);
        lines.push(`		}`);
        lines.push(`		return true;`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`class Request {`);
        lines.push(`	public string $method;`);
        lines.push(`	public array $base_components;`);
        lines.push(`	public array $components;`);
        lines.push(`	public object $parameters;`);
        lines.push(`	public object $headers;`);
        lines.push(`	public mixed $payload;`);
        lines.push(`	public object $options;`);
        lines.push(``);
        lines.push(`	function __construct() {`);
        lines.push(`		$this->method = Request::get_method();`);
        lines.push(`		$this->base_components = Request::get_base_components();`);
        lines.push(`		$this->components = Request::get_components();`);
        lines.push(`		$this->parameters = Request::get_parameters();`);
        lines.push(`		$this->headers = Request::get_headers();`);
        lines.push(`		$this->payload = Request::get_payload();`);
        lines.push(`		$this->options = (object) [];`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function get_base_path(): string {`);
        lines.push(`		return implode("/", array_map(fn ($component) => rawurlencode($component), $this->base_components)) . "/";`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	function get_path(): string {`);
        lines.push(`		return implode("/", array_map(fn ($component) => rawurlencode($component), $this->components));`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function get_method(): string {`);
        lines.push(`		return $_SERVER["REQUEST_METHOD"];`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function get_base_components(): array {`);
        lines.push(`		$script_name_parts = explode("/", $_SERVER["SCRIPT_NAME"]);`);
        lines.push(`		$request_uri_parts = explode("/", explode("?", $_SERVER["REQUEST_URI"])[0]);`);
        lines.push(`		$i = 0;`);
        lines.push(`		for (; $i < count($script_name_parts) && $i < count($request_uri_parts); $i++) {`);
        lines.push(`			if ($script_name_parts[$i] !== $request_uri_parts[$i]) {`);
        lines.push(`				break;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		$components = array_slice($request_uri_parts, 0, $i);`);
        lines.push(`		$components = array_map(fn ($component) => urldecode($component), $components);`);
        lines.push(`		return $components;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function get_components(): array {`);
        lines.push(`		$script_name_parts = explode("/", $_SERVER["SCRIPT_NAME"]);`);
        lines.push(`		$request_uri_parts = explode("/", explode("?", $_SERVER["REQUEST_URI"])[0]);`);
        lines.push(`		$i = 0;`);
        lines.push(`		for (; $i < count($script_name_parts) && $i < count($request_uri_parts); $i++) {`);
        lines.push(`			if ($script_name_parts[$i] !== $request_uri_parts[$i]) {`);
        lines.push(`				break;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		$components = array_slice($request_uri_parts, $i);`);
        lines.push(`		$components = array_map(fn ($component) => urldecode($component), $components);`);
        lines.push(`		return $components;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function get_parameters(): object {`);
        lines.push(`		$parameters = (object) [];`);
        lines.push(`		$query = $_SERVER["QUERY_STRING"];`);
        lines.push(`		if ($query !== "") {`);
        lines.push(`			foreach (explode("&", $query) as $part) {`);
        lines.push(`				$parts = explode("=", $part);`);
        lines.push(`				$key = urldecode($parts[0]);`);
        lines.push(`				$value = urldecode(implode("=", array_slice($parts, 1)));`);
        lines.push(`				$parameters->$key = $value;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		return $parameters;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function get_headers(): object {`);
        lines.push(`		$headers = getallheaders();`);
        lines.push(`		$headers = array_change_key_case($headers);`);
        lines.push(`		return (object) $headers;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function get_payload(): mixed {`);
        lines.push(`		return file_get_contents("php://input");`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`abstract class Route {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	abstract function accepts_components(array $components): bool;`);
        lines.push(`	abstract function accepts_method(string $method): bool;`);
        lines.push(`	abstract function accepts_accepts(array $accepts): bool;`);
        lines.push(`	abstract function prepare_request(object $request): object;`);
        lines.push(`	abstract function validate_request(object $request): object;`);
        lines.push(`	abstract function handle_request(object $request): object;`);
        lines.push(`	abstract function validate_response(object $response): object;`);
        lines.push(`	abstract function finalize_response(object $response): object;`);
        lines.push(``);
        lines.push(`	static function respond(array $routes): void {`);
        lines.push(`		try {`);
        lines.push(`			$request = new Request();`);
        lines.push(`			$routes = array_filter($routes, fn ($route) => $route->accepts_components($request->components));`);
        lines.push(`			if (count($routes) === 0) {`);
        lines.push(`				throw new HTTPException(Status::NOT_FOUND);`);
        lines.push(`			}`);
        lines.push(`			$routes = array_filter($routes, fn ($route) => $route->accepts_method($request->method));`);
        lines.push(`			if (count($routes) === 0) {`);
        lines.push(`				throw new HTTPException(Status::METHOD_NOT_ALLOWED);`);
        lines.push(`			}`);
        lines.push(`			$routes = array_filter($routes, fn ($route) => $route->accepts_accepts(self::parse_multi_valued_header($request->headers->accept ?? null)));`);
        lines.push(`			if (count($routes) === 0) {`);
        lines.push(`				throw new HTTPException(Status::NOT_ACCEPTABLE);`);
        lines.push(`			}`);
        lines.push(`			$routes = array_values($routes);`);
        lines.push(`			$route = $routes[0];`);
        lines.push(`			$request = $route->prepare_request($request);`);
        lines.push(`			$request = $route->validate_request($request);`);
        lines.push(`			$response = $route->handle_request($request);`);
        lines.push(`			$response->status = $response->status ?? Status::OK;`);
        lines.push(`			$response->headers = $response->headers ?? (object) [];`);
        lines.push(`			$response->headers = (object) array_change_key_case((array) $response->headers);`);
        lines.push(`			$response->payload = $response->payload ?? "";`);
        lines.push(`			$response = $route->validate_response($response);`);
        lines.push(`			$response = $route->finalize_response($response);`);
        lines.push(`			$if_modified_since = $request->headers->{"if-modified-since"} ?? null;`);
        lines.push(`			$last_modified = $response->headers->{"last-modified"} ?? null;`);
        lines.push(`			if ($if_modified_since !== null && $last_modified !== null) {`);
        lines.push(`				if (strtotime($last_modified) <= strtotime($if_modified_since)) {`);
        lines.push(`					$response->status = Status::NOT_MODIFIED;`);
        lines.push(`					$response->payload = "";`);
        lines.push(`				}`);
        lines.push(`			}`);
        lines.push(`			http_response_code($response->status);`);
        lines.push(`			foreach ($response->headers as $key => $value) {`);
        lines.push(`				header($key . ": " . $value);`);
        lines.push(`			}`);
        lines.push(`			echo($response->payload);`);
        lines.push(`		} catch (\\Exception $exception) {`);
        lines.push(`			if ($exception instanceof HTTPException) {`);
        lines.push(`				http_response_code($exception->status);`);
        lines.push(`				echo($exception->getMessage());`);
        lines.push(`			} else {`);
        lines.push(`				http_response_code(500);`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function accepts_content_type(array $accepts, string $content_type): bool {`);
        lines.push(`		if (count($accepts) === 0) {`);
        lines.push(`			return true;`);
        lines.push(`		}`);
        lines.push(`		$content_type = trim(explode(";", $content_type)[0]);`);
        lines.push(`		foreach ($accepts as $accept) {`);
        lines.push(`			$accept = preg_replace("/[.]/", "[.]", $accept);`);
        lines.push(`			$accept = preg_replace("/[\\/]/", "[\\\\/]", $accept);`);
        lines.push(`			$accept = preg_replace("/[-]/", "[-]", $accept);`);
        lines.push(`			$accept = preg_replace("/[+]/", "[+]", $accept);`);
        lines.push(`			$accept = preg_replace("/[*]/", "(.+)", $accept);`);
        lines.push(`			$expression = "/^{$accept}$/";`);
        lines.push(`			if (preg_match($expression, $content_type)) {`);
        lines.push(`				return true;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`		return false;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function guard_request(object $request, Guard $guard): object {`);
        lines.push(`		try {`);
        lines.push(`			return $guard->as($request, "request");`);
        lines.push(`		} catch (\\Exception $exception) {`);
        lines.push(`			if ($exception instanceof GuardException) {`);
        lines.push(`				throw new HTTPException(Status::BAD_REQUEST, $exception->getMessage());`);
        lines.push(`			} else {`);
        lines.push(`				throw $exception;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function guard_response(object $response, Guard $guard): object {`);
        lines.push(`		try {`);
        lines.push(`			return $guard->as($response, "response");`);
        lines.push(`		} catch (\\Exception $exception) {`);
        lines.push(`			if ($exception instanceof GuardException) {`);
        lines.push(`				throw new HTTPException(Status::INTERNAL_SERVER_ERROR, $exception->getMessage());`);
        lines.push(`			} else {`);
        lines.push(`				throw $exception;`);
        lines.push(`			}`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function pathify(string $string): string {`);
        lines.push(`		$string = mb_strtolower($string);`);
        lines.push(`		$string = normalizer_normalize($string, \\Normalizer::NFKD);`);
        lines.push(`		$string = preg_replace("/[\\|\\/\\\\\\_\\-]/", " ", $string);`);
        lines.push(`		$string = preg_replace("/[^a-z0-9 ]/", "", $string);`);
        lines.push(`		$string = trim($string);`);
        lines.push(`		$string = implode("-", preg_split("/[ ]+/", $string));`);
        lines.push(`		return $string;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function parse_multi_valued_header(?string $string): array {`);
        lines.push(`		if ($string === null) {`);
        lines.push(`			return [];`);
        lines.push(`		}`);
        lines.push(`		$parts = explode(",", $string);`);
        lines.push(`		$parts = array_map(fn ($part) => explode(";", $part)[0], $parts);`);
        lines.push(`		$parts = array_map(fn ($part) => trim($part), $parts);`);
        lines.push(`		return $parts;`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function parse_json(string $subject): mixed {`);
        lines.push(`		return json_decode($subject);`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function parse_member(object $target, object $source, string $key, bool $plain): void {`);
        lines.push(`		if (property_exists($source, $key)) {`);
        lines.push(`			$target->$key = $plain ? $source->$key : Route::parse_json($source->$key);`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function serialize_json(mixed $subject): string {`);
        lines.push(`		return json_encode($subject, JSON_PRESERVE_ZERO_FRACTION | JSON_UNESCAPED_UNICODE);`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function serialize_member(object $target, object $source, string $key, bool $plain): void {`);
        lines.push(`		if (property_exists($source, $key)) {`);
        lines.push(`			$target->$key = $plain ? $source->$key : Route::serialize_json($source->$key);`);
        lines.push(`		}`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`abstract class Status {`);
        lines.push(`	const CONTINUE = 100;`);
        lines.push(`	const SWITCHING_PROTOCOLS = 101;`);
        lines.push(`	const PROCESSING = 102;`);
        lines.push(`	const EARLY_HINTS = 103;`);
        lines.push(`	const OK = 200;`);
        lines.push(`	const CREATED = 201;`);
        lines.push(`	const ACCEPTED = 202;`);
        lines.push(`	const NON_AUTHORITATIVE_INFORMATION = 203;`);
        lines.push(`	const NO_CONTENT = 204;`);
        lines.push(`	const RESET_CONTENT = 205;`);
        lines.push(`	const PARTIAL_CONTENT = 206;`);
        lines.push(`	const MULTI_STATUS = 207;`);
        lines.push(`	const ALREADY_REPORTED = 208;`);
        lines.push(`	const IM_USED = 226;`);
        lines.push(`	const MULTIPLE_CHOICES = 300;`);
        lines.push(`	const MOVED_PERMANENTLY = 301;`);
        lines.push(`	const FOUND = 302;`);
        lines.push(`	const SEE_OTHER = 303;`);
        lines.push(`	const NOT_MODIFIED = 304;`);
        lines.push(`	const USE_PROXY = 305;`);
        lines.push(`	const SWITCH_PROXY = 306;`);
        lines.push(`	const TEMPORARY_REDIRECT = 307;`);
        lines.push(`	const PERMANENT_REDIRECT = 308;`);
        lines.push(`	const BAD_REQUEST = 400;`);
        lines.push(`	const UNAUTHORIZED = 401;`);
        lines.push(`	const PAYMENT_REQUIRED = 402;`);
        lines.push(`	const FORBIDDEN = 403;`);
        lines.push(`	const NOT_FOUND = 404;`);
        lines.push(`	const METHOD_NOT_ALLOWED = 405;`);
        lines.push(`	const NOT_ACCEPTABLE = 406;`);
        lines.push(`	const PROXY_AUTHENTICATION_REQUIRED = 407;`);
        lines.push(`	const REQUEST_TIMEOUT = 408;`);
        lines.push(`	const CONFLICT = 409;`);
        lines.push(`	const GONE = 410;`);
        lines.push(`	const LENGTH_REQUIRED = 411;`);
        lines.push(`	const PRECONDITION_FAILED = 412;`);
        lines.push(`	const PAYLOAD_TOO_LARGE = 413;`);
        lines.push(`	const URI_TOO_LONG = 414;`);
        lines.push(`	const UNSUPPORTED_MEDIA_TYPE = 415;`);
        lines.push(`	const RANGE_NOT_SATISFIABLE = 416;`);
        lines.push(`	const EXPECTATION_FAILED = 417;`);
        lines.push(`	const IM_A_TEAPOT = 418;`);
        lines.push(`	const MISDIRECTED_REQUEST = 421;`);
        lines.push(`	const UNPROCESSABLE_ENTITY = 422;`);
        lines.push(`	const LOCKED = 423;`);
        lines.push(`	const FAILED_DEPENDENCY = 424;`);
        lines.push(`	const TOO_EARLY = 425;`);
        lines.push(`	const UPGRADE_REQUIRED = 426;`);
        lines.push(`	const PRECONDITION_REQUIRED = 428;`);
        lines.push(`	const TOO_MANY_REQUESTS = 429;`);
        lines.push(`	const REQUEST_HEADER_FIELDS_TOO_LARGE = 431;`);
        lines.push(`	const UNAVAILABLE_FOR_LEAGAL_REASONS = 451;`);
        lines.push(`	const INTERNAL_SERVER_ERROR = 500;`);
        lines.push(`	const NOT_IMPLEMENTED = 501;`);
        lines.push(`	const BAD_GATEWAY = 502;`);
        lines.push(`	const SERVICE_UNAVAILABLE = 503;`);
        lines.push(`	const GATEWAY_TIMEOUT = 504;`);
        lines.push(`	const HTTP_VERSION_NOT_SUPPORTED = 505;`);
        lines.push(`	const VARIANT_ALSO_NEGOTIATES = 506;`);
        lines.push(`	const INSUFFICIENT_STORAGE = 507;`);
        lines.push(`	const LOOP_DETECTED = 508;`);
        lines.push(`	const NOT_EXTENDED = 510;`);
        lines.push(`	const NETWORK_AUTHENTICATION_REQUIRED = 511;`);
        lines.push(``);
        lines.push(`	function __construct() {}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`abstract class Base64URL {`);
        lines.push(`	function __construct() {}`);
        lines.push(``);
        lines.push(`	static function decode(string $string): string {`);
        lines.push(`		return base64_decode(str_replace(["-", "_"], ["+", "/"], $string));`);
        lines.push(`	}`);
        lines.push(``);
        lines.push(`	static function encode(string $string): string {`);
        lines.push(`		return str_replace(["+", "/", "="], ["-", "_", ""], base64_encode($string));`);
        lines.push(`	}`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`?>`);
        lines.push(``);
        let content = lines.join(eol);
        return {
            name: `./Autoguard.php`,
            content: content,
            overwrite: true
        };
    }
    generateIndexFile(schema, eol) {
        let lines = [];
        lines.push(`<?php namespace autoguard;`);
        lines.push(``);
        for (let route of schema.routes) {
            let name = route.alias.identifier;
            if (name === "") {
                throw new Error(`Route not supported by generator!`);
            }
            lines.push(`require_once(__DIR__ . "/./routes/${name}.php");`);
        }
        lines.push(`require_once(__DIR__ . "/./Autoguard.php");`);
        lines.push(``);
        {
            let bodylines = [];
            for (let route of schema.routes) {
                let name = route.alias.identifier;
                if (name === "") {
                    throw new Error(`Route not supported by generator!`);
                }
                bodylines.push(`	new ${name}()`);
            }
            let content = bodylines.length === 0 ? "" : eol + bodylines.join("," + eol) + eol;
            lines.push(`Route::respond([${content}]);`);
        }
        lines.push(``);
        lines.push(`?>`);
        lines.push(``);
        let content = lines.join(eol);
        return {
            name: `./index.php`,
            content: content,
            overwrite: true
        };
    }
    generate(schema, eol) {
        let files = [];
        files.push(this.generateHtaccessFile(eol));
        files.push(this.generateAutoguardFile(eol));
        files.push(this.generateIndexFile(schema, eol));
        files.push(this.generateBaseFile(schema, eol));
        for (let route of schema.routes) {
            files.push(this.generateBaseRouteFile(route, eol));
            files.push(this.generateRouteFile(route, eol));
        }
        return files;
    }
}
exports.PHPAPIGenerator = PHPAPIGenerator;
;
