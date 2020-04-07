import React, { useState } from 'react'
import { BlockValue, CodeBlockValue } from '../types'
import SimpleMDEReact from 'react-simplemde-editor'
import { Field, ErrorMessage } from 'formik'
import { Dropdown, Menu, Icon, Button as AntButton } from 'antd'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/mode/typescript'
import 'brace/mode/scss'
import 'brace/mode/html'
import 'brace/mode/powershell'
import 'brace/mode/rust'
import 'brace/theme/github'
import { isMobile } from 'react-device-detect'

type Props = {
  block: BlockValue | CodeBlockValue
  index: number
  setFieldValue: (field: string, value: any) => void
  handleLinkChange: (block: BlockValue, name: string, value: string) => void
  blockValues: BlockValue[] | CodeBlockValue[]
  addMenu: (index?: number) => JSX.Element
}

const PostBlockFormik = (props: Props) => {
  const { block, index, setFieldValue, handleLinkChange, blockValues, addMenu } = props

  const [ inputFocus, setInputFocus ] = useState<{id: number, focus: boolean}[]>([])

  const langs = [
    { name: 'javascript', pretty: 'JavaScript' },
    { name: 'typescript', pretty: 'TypeScript' },
    { name: 'html', pretty: 'HTML' },
    { name: 'scss', pretty: 'CSS/SCSS' },
    { name: 'rust', pretty: 'Rust' },
    { name: 'powershell', pretty: 'PowerShell' }
  ]

  const handleFocus = (focus: boolean, id: number) => {
    const newArray = [ ...inputFocus ]
    const idx = newArray.findIndex((x) => x.id === id)

    if (idx === -1) {
      newArray.push({
        id, focus
      })
    } else {
      newArray[idx].focus = focus
    }

    setInputFocus(newArray)
  }

  const modesMenu = (id: number) => (
    <Menu className=''>
      {langs.map((x) => (
        <Menu.Item key={x.name} onClick={() => handleAceMode(x.name, id)} >
          {x.pretty}
        </Menu.Item>
      ))}
    </Menu>
  )

  const handleAceMode = (mode: string, id: number) => {
    const bvIdx = blockValues.findIndex((x) => x.id === id)
    setFieldValue(`blockValues.${bvIdx}.lang`, mode)
  }

  const removeBlock = (id: number) => {
    const idx = blockValues.findIndex((x) => x.id === id)

    setFieldValue('blockValues', [
      ...blockValues.slice(0, idx),
      ...blockValues.slice(idx + 1)
    ])
  }

  const changeBlockPosition = (order: number, index: number) => {

    const newBlocksOrder = [ ...blockValues ]
    newBlocksOrder[index] = blockValues[index + order]
    newBlocksOrder[index + order] = blockValues[index]

    setFieldValue('blockValues', newBlocksOrder)
  }

  let res

  switch (block.kind) {
    case 'text': {
      res = <SimpleMDEReact
        value={block.data}
        onChange={(data: string) => setFieldValue(`blockValues.${index}.data`, data)}
        className={`DfMdEditor`}
        events={{
          blur: () => handleFocus(false, block.id),
          focus: () => handleFocus(true, block.id)
        }}
      />
      break
    }
    case 'link': {
      res = <Field
        type="text"
        name={`blockValues.${index}.data`}
        placeholder="Link"
        value={block.data}
        onFocus={() => handleFocus(true, block.id)}
        onBlur={() => handleFocus(false, block.id)}
        onChange={(e: React.FormEvent<HTMLInputElement>) => handleLinkChange(block, `blockValues.${index}.data`, e.currentTarget.value)}
      />
      break
    }
    case 'image': {
      res = <Field
        type="text"
        name={`blockValues.${index}.data`}
        placeholder="Image link"
        value={block.data}
        onFocus={() => handleFocus(true, block.id)}
        onBlur={() => handleFocus(false, block.id)}
        onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`blockValues.${index}.data`, e.currentTarget.value)}
      />
      break
    }
    case 'code': {
      const { lang } = block as CodeBlockValue
      const pretty = langs.find((x) => x.name === lang)?.pretty
      res = <div className='EditPostAceEditor'>
        <Dropdown overlay={() => modesMenu(block.id)} className={'aceModeSelect'}>
          <a href='#' onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => e.preventDefault()}>
            <Icon type="down" /> Syntax: {pretty || 'JavaScript'}
          </a>
        </Dropdown>
        <AceEditor
          mode={lang || 'javascript'}
          theme="github"
          onChange={(value: string) => setFieldValue(`blockValues.${index}.data`, value)}
          value={block.data}
          name="ace-editor"
          editorProps={{ $blockScrolling: true }}
          height='200px'
          width='100%'
          onFocus={() => handleFocus(true, block.id)}
          onBlur={() => handleFocus(false, block.id)}
        />
      </div>
      break
    }
    default: {
      return null
    }
  }

  const maxBlockId = Math.max.apply(null, blockValues.map((x) => {
    return x.id
  }))

  const currentFocus = inputFocus.find((z) => z.id === block.id)

  return <div className={`EditPostBlockWrapper ${currentFocus?.focus ? 'inputFocus' : ''} ${isMobile ? 'mobileBlock' : ''}`} key={block.id} >
    {res}
    <ErrorMessage name={`blockValues.${index}.data`} component='div' className='ui pointing red label' />

    <div className='navigationButtons'>
      <Dropdown overlay={() => addMenu(index)}>
        <AntButton type="default" className={'smallAntButton'} size="small"><Icon type="plus-circle" /> Add block</AntButton>
      </Dropdown>
      <AntButton type="default" size="small" onClick={() => removeBlock(block.id)} className={'smallAntButton'}>
        <Icon type="delete" />
        Delete
      </AntButton>
      <AntButton className={'smallAntButton'} size="small" type="default" onClick={() => setFieldValue(`blockValues.${index}.hidden`, !block.hidden)}>
        {block.hidden
          ? <div><Icon type="eye" /> Show block</div>
          : <div><Icon type="eye-invisible" /> Hide block</div>
        }
      </AntButton>
      { index > 0 &&
        <AntButton className={'smallAntButton'} size="small" type="default" onClick={() => changeBlockPosition(-1, index)} >
          <Icon type="up-circle" /> Move up
        </AntButton> }
      { index < maxBlockId &&
        <AntButton className={'smallAntButton'} size="small" type="default" onClick={() => changeBlockPosition(1, index)} >
          <Icon type="down-circle" /> Move down
        </AntButton> }
    </div>
  </div>

}

export default PostBlockFormik
