import React from 'react'
import BigNumbersWidget from './BigNumbersWidget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'
import {
  WidgetEditorFieldGroup,
  WidgetEditorList
} from '../util/widgetElements'

class Email extends BigNumbersWidget {
  constructor (props) {
    super('Email', 'email', props)
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && this.renderBigNumbers([
      {
        label: 'Unread',
        value: data.unread
      },
      {
        label: 'Flagged',
        value: data.flagged
      }
    ])
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    const mailboxTypes = [
      {
        name: 'exchange',
        label: 'Microsoft Exchange'
      },
      {
        name: 'imap',
        label: 'IMAP'
      }
    ]
    if (tempConfig) {
      return (
        <WidgetEditorList
          wrapperClassName='email-config-mailboxes'
          list={tempConfig.mailboxes || []}
          sectionClassNames={['email-config-mailbox']}
          renderSection={(mailbox, i) => {
            return (
              <div>
                <WidgetEditorFieldGroup name='Type'>
                  <select className='widget-editor-input' value={mailbox.type} onChange={(event) => this.setTempConfigArrayIndexValue('mailboxes', i, 'type', mailboxTypes[event.target.selectedIndex - 1].name)}>
                    <option value=''>Select Mailbox</option>
                    {
                      mailboxTypes.map((type, j) => {
                        return (<option key={j} value={type.name}>{type.label}</option>)
                      })
                    }
                  </select>
                </WidgetEditorFieldGroup>
                { this.renderMailboxConfig(mailbox, i) }
              </div>
            )
          }}
          removable
          appendable
          translateItem={(i, d) => this.moveTempConfigArrayIndex('mailboxes', i, d)}
          append={() => this.addTempConfigArrayObject('mailboxes', {type: '', credentials: {}})} />
      )
    } else {
      return null
    }
  }

  setMailboxCredentialValue (index, key, value) {
    const credentials = Object.assign({}, this.getWidgetTempConfig().mailboxes[index].credentials)
    credentials[key] = value
    this.setTempConfigArrayIndexValue('mailboxes', index, 'credentials', credentials)
  }

  renderMailboxConfig (mailbox, i) {
    switch (mailbox.type) {
      case 'exchange':
        return (
          <div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Server URL</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.url} onChange={(event) => this.setMailboxCredentialValue(i, 'url', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Username</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.username} onChange={(event) => this.setMailboxCredentialValue(i, 'username', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Password</label>
              <input className='widget-editor-input' type='password' value={mailbox.credentials.password} onChange={(event) => this.setMailboxCredentialValue(i, 'password', event.target.value)} />
            </div>
          </div>
        )
      case 'imap':
        return (
          <div>
            <WidgetEditorFieldGroup name='Hostname'>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.host} onChange={(event) => this.setMailboxCredentialValue(i, 'host', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Username'>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.user} onChange={(event) => this.setMailboxCredentialValue(i, 'user', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Password'>
              <input className='widget-editor-input' type='password' value={mailbox.credentials.password} onChange={(event) => this.setMailboxCredentialValue(i, 'password', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Port'>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.port} onChange={(event) => this.setMailboxCredentialValue(i, 'port', event.target.value)} />
            </WidgetEditorFieldGroup>
            <label className='widget-editor-label'>
              <input type='checkbox' checked={mailbox.credentials.tls} onChange={(event) => this.setMailboxCredentialValue(i, 'tls', event.target.checked)} />
              TLS
            </label>
            <WidgetEditorFieldGroup name='Flagged Mailbox Name'>
              <input className='widget-editor-input' type='text' value={mailbox.flagMailboxName} onChange={(event) => this.setTempConfigArrayIndexValue('mailboxes', i, 'flagMailboxName', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Unread Mailbox Name'>
              <input className='widget-editor-input' type='text' value={mailbox.unreadMailboxName} onChange={(event) => this.setTempConfigArrayIndexValue('mailboxes', i, 'unreadMailboxName', event.target.value)} />
            </WidgetEditorFieldGroup>
          </div>
        )
      default:
        return null
    }
  }
}

const stateToProps = (state) => {
  return {
    services: state.services
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    commitTempConfig,
    setTemporaryConfig,
    removeService
  }, dispatch)
}

Email.widgetProps = {
  h: 1.5,
  isResizable: false
}

export default connect(stateToProps, dispatchToProps)(Email)
