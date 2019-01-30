import * as React from 'react'

type GetSet = {
  get(): any
  set(x: any): void
}

export class Input extends React.Component<GetSet & React.InputHTMLAttributes<HTMLInputElement>> {
  onChange = (ev: any) => this.props.set(ev.target.value)

  render() {
    const {get, set, ...rest} = this.props

    return <input value={get()} onChange={this.onChange} {...rest} />
  }
}

export class Checkbox extends React.Component<GetSet & React.InputHTMLAttributes<HTMLInputElement>> {
  onChange = (ev: any) => this.props.set(ev.target.checked)

  render() {
    const {get, set, ...rest} = this.props

    return <input type='checkbox' checked={get()} onChange={this.onChange} {...rest} />
  }
}

export class Radio extends React.Component<GetSet & {name: string, value: string} & React.InputHTMLAttributes<HTMLInputElement>> {
  onChange = () => this.props.set(this.props.value)

  render() {
    const {get, set, name, value, ...rest} = this.props

    return <input type='radio' name={name} checked={get().toString() === value} onChange={this.onChange} {...rest} />
  }
}

export class Select extends React.Component<GetSet & {items(): ReadonlyArray<any>} & React.SelectHTMLAttributes<HTMLSelectElement>> {
  onChange = (ev: any) => this.props.set(ev.target.value)

  render() {
    const {get, set, items, ...rest} = this.props

    return (
      <select value={get()} onChange={this.onChange} {...rest}>
        {items().map(x => <option key={x} value={x}>{x}</option>)}
      </select>
    )
  }
}

export class Textarea extends React.Component<GetSet & React.TextareaHTMLAttributes<HTMLTextAreaElement>> {

}
