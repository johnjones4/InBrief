import React from 'react'
import PropTypes from 'prop-types'

export const WidgetEditorFieldGroup = (props) => {
  return (
    <div className='widget-editor-input-group'>
      <label className='widget-editor-label'>{props.name}</label>
      { props.children }
    </div>
  )
}

WidgetEditorFieldGroup.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.any
}

export const WidgetEditorList = (props) => {
  return (
    <div className={props.wrapperClassName}>
      {
        props.list.map((item, i) => {
          return (
            <div className={['widget-editor-section', 'widget-editor-list-section'].concat(props.sectionClassNames || []).join(' ')} key={i}>
              {props.renderSection(item, i)}
              <div className='widget-editor-list-section-controls'>
                {props.movable && (
                  <span>
                    <button className='small' onClick={() => props.translateItem(i, i - 1)}>&#x25B2;</button>
                    <button className='small' onClick={() => props.translateItem(i, i + 1)}>&#x25BC;</button>
                  </span>
                )}
                {props.removable && (
                  <button className='small destructive' onClick={() => props.removeItem(i)}>Remove</button>
                )}
              </div>
            </div>
          )
        })
      }
      { props.appendable && (<button className='additive' onClick={() => props.append()}>Add</button>) }
    </div>
  )
}

WidgetEditorList.propTypes = {
  wrapperClassName: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  sectionClassNames: PropTypes.array,
  renderSection: PropTypes.func.isRequired,
  removable: PropTypes.bool,
  movable: PropTypes.bool,
  appendable: PropTypes.bool,
  append: PropTypes.func
}
