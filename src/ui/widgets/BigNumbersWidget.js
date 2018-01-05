import React from 'react'
import Widget from './Widget'

export default class BigNumbersWidget extends Widget {
  componentDidMount () {
    window.addEventListener('resize', () => this.forceUpdate())
  }

  renderBigNumbers (bigNumbers) {
    let width = 'auto'
    if (bigNumbers && this.bigNumbersElement) {
      const maxWidth = this.bigNumbersElement.offsetWidth / bigNumbers.length
      const desiredWidth = this.bigNumbersElement.offsetHeight
      width = maxWidth >= desiredWidth ? desiredWidth : maxWidth
    }
    return bigNumbers && (
      <div className='widget-big-numbers' ref={(div) => { this.bigNumbersElement = div }}>
        {
          bigNumbers.map((bigNumber, i) => {
            return (
              <div className='widget-big-numbers-group' key={i} style={{width}}>
                <div className='widget-big-numbers-number'>
                  {bigNumber.value}
                </div>
                <div className='widget-big-numbers-label'>
                  {bigNumber.label}
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}
