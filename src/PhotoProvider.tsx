import React from 'react';
import PhotoContext, { onShowType, updateItemType, removeItemType } from './photo-context';
import PhotoSlider from './PhotoSlider';
import { dataType, IPhotoProviderBase } from './types';

export interface IPhotoProvider extends IPhotoProviderBase {
  children: React.ReactNode;
  onIndexChange?: (index: number, state: PhotoProviderState) => void;
  onVisibleChange?: (visible: boolean, index: number, state: PhotoProviderState) => void;
}

type PhotoProviderState = {
  images: dataType[];
  visible: boolean;
  index: number;
  onShow: onShowType;
  updateItem: updateItemType;
  removeItem: removeItemType;
};

export default class PhotoProvider extends React.Component<IPhotoProvider, PhotoProviderState> {
  constructor(props) {
    super(props);

    this.state = {
      images: [],
      visible: false,
      index: 0,
      updateItem: this.handleUpdateItem,
      removeItem: this.handleRemoveItem,
      onShow: this.handleShow,
    };
  }

  handleUpdateItem: updateItemType = (imageItem) => {
    this.setState((prev) => {
      const { images } = prev;
      const index = images.findIndex((n) => n.key === imageItem.key);
      if (index > -1) {
        images.splice(index, 1, imageItem);
        return {
          images: [...images],
        };
      }
      return {
        images: images.concat(imageItem),
      };
    });
  };

  handleRemoveItem = (key: string) => {
    this.setState(({ images, index }) => {
      const nextImages = images.filter((item) => item.key !== key);
      const nextEndIndex = nextImages.length - 1;
      return {
        images: nextImages,
        index: Math.min(nextEndIndex, index),
      };
    });
  };

  handleShow = (key: string) => {
    const { onVisibleChange } = this.props;
    const { images } = this.state;
    const index = images.findIndex((item) => item.key === key);
    this.setState({
      visible: true,
      index,
    });

    if (typeof onVisibleChange === 'function') {
      onVisibleChange(true, index, this.state);
    }
  };

  handleClose = () => {
    const { onVisibleChange } = this.props;
    this.setState({
      visible: false,
    });

    if (typeof onVisibleChange === 'function') {
      onVisibleChange(false, this.state.index, this.state);
    }
  };

  handleIndexChange = (index: number) => {
    const { onIndexChange } = this.props;
    this.setState({
      index,
    });

    if (typeof onIndexChange === 'function') {
      onIndexChange(index, this.state);
    }
  };

  render() {
    const { children, onIndexChange, onVisibleChange, ...restProps } = this.props;
    const { images, visible, index } = this.state;

    return (
      <PhotoContext.Provider value={this.state}>
        {children}
        <PhotoSlider
          images={images}
          visible={visible}
          index={index}
          onIndexChange={this.handleIndexChange}
          onClose={this.handleClose}
          {...restProps}
        />
      </PhotoContext.Provider>
    );
  }
}
